#!/usr/bin/env python3
"""Render the complete Beyond Gravity documentary using free Kokoro 82M ONNX.
No accounts, voice-cloning samples, API keys, paid TTS, or runtime model downloads.
Requires kokoro-onnx>=0.6.0, numpy, soundfile, ffmpeg, model and voices.
Writes 12 male chapters, 6 female guide clips, female intro, and aligned WebVTT.
Output rights follow the upstream Kokoro Apache-2.0 and voice-pack notices.
"""
import argparse
import math
import re
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"src"
AUDIO=ROOT/"public/audio"

@dataclass(frozen=True)
class Script:
    name:str
    voice:str
    text:str

def parse_scripts(male:str,female:str):
    data=(SOURCE/"data.ts").read_text(encoding="utf-8")
    story=(SOURCE/"story.ts").read_text(encoding="utf-8")
    chapter_base=re.findall(r"narration:'(.*?)',tag:",data,re.DOTALL)
    beats=re.findall(r"voice:'(.*?)',equation:",story,re.DOTALL)
    parts=re.findall(r"id:'(body|fans|vessel|thrusters|wheels|computer)'.*?female:'(.*?)',principle:",data,re.DOTALL)
    assert len(chapter_base)==12, f"Expected 12 chapter introductions, got {len(chapter_base)}"
    assert len(beats)==36, f"Expected 36 detailed chapter beats, got {len(beats)}"
    assert len(parts)==6, f"Expected 6 interactive guides, got {len(parts)}"
    chapters=[Script(f"male-{i:02d}",male," ".join([chapter_base[i],*beats[i*3:i*3+3]])) for i in range(12)]
    guides=[Script("female-"+part,female,text) for part,text in parts]
    guides.append(Script("female-intro",female,"Beyond Gravity. A documentary you can step inside. The stunt. The science. The future."))
    return chapters+guides

def paragraphs(text,max_chars=300):
    # Keep sentences together for natural prosody and add a measured pause between chunks.
    phrases=re.split(r"(?<=[.!?])\s+",text.strip())
    out=[];chunk=""
    for phrase in phrases:
        if len(phrase)>max_chars:
            if chunk:out.append(chunk);chunk=""
            words=phrase.split()
            segment=""
            for word in words:
                if len(segment)+len(word)+1>max_chars and segment:
                    out.append(segment);segment=""
                segment=(segment+" "+word).strip()
            if segment:out.append(segment)
        elif chunk and len(chunk)+len(phrase)+1>max_chars:
            out.append(chunk);chunk=phrase
        else:chunk=(chunk+" "+phrase).strip()
    if chunk:out.append(chunk)
    return out

def caption_phrases(text,max_chars=87):
    """Sentence-aware subtitle cue groups, normally 7-13 words."""
    words=list(re.finditer(r"\S+",text))
    out=[]
    start=0
    while start<len(words):
        end=start;length=0
        while end<len(words):
            word=words[end].group()
            if end>start and length+len(word)+1>max_chars:break
            length+=len(word)+1;end+=1
            if re.search(r"[.!?]$",word) and end-start>=6:break
        out.append((start,end," ".join(w.group() for w in words[start:end])))
        start=end
    return out

def subtitle_timing(clip,chunk_text,time_offset,duration,timings):
    """Use model phoneme durations if returned. Conservative interpolation otherwise."""
    words=chunk_text.split()
    phoneme_words=[]
    last_start=None;last_end=None
    for p in timings:
        if p.phoneme==" ":
            if last_start is not None:
                phoneme_words.append((float(last_start),float(last_end)))
                last_start=None
            continue
        if last_start is None:last_start=float(p.start)
        last_end=float(p.end)
    if last_start is not None:phoneme_words.append((last_start,float(last_end)))
    output=[]
    for first,end,text in caption_phrases(chunk_text):
        if len(phoneme_words)>=max(3,len(words)//2):
            # Phonemic G2P token count differs on acronyms/numerals; monotonic approximation.
            i=round(first*len(phoneme_words)/len(words))
            j=max(i+1,round(end*len(phoneme_words)/len(words)))
            i=min(i,len(phoneme_words)-1);j=min(j,len(phoneme_words))
            begin=phoneme_words[i][0];stop=phoneme_words[j-1][1]
        else:
            begin=duration*first/max(1,len(words));stop=duration*end/max(1,len(words))
        output.append((time_offset+max(0,begin),time_offset+min(duration,max(stop,begin+.06)),text))
    return output

def timestamp(sec):
    millis=int(round(sec*1000))
    h,rem=divmod(millis,3600000);m,rem=divmod(rem,60000);s,ms=divmod(rem,1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

def build(argv=None):
    ap=argparse.ArgumentParser()
    ap.add_argument("--model",type=Path,default=ROOT/"kokoro-v1.0.onnx")
    ap.add_argument("--voices",type=Path,default=ROOT/"voices-v1.0.bin")
    ap.add_argument("--male",default="am_michael",help="Male documentary voice from Kokoro VOICES.md")
    ap.add_argument("--female",default="af_heart",help="Female component guide")
    ap.add_argument("--limit",type=int,default=0,help="Produce only first N clips (QA)")
    ap.add_argument("--dry-run",action="store_true",help="Verify scripts, no model needed")
    ap.add_argument("--overwrite",action="store_true")
    args=ap.parse_args(argv)
    scripts=parse_scripts(args.male,args.female)
    if args.limit:scripts=scripts[:args.limit]
    print("Selected clips:",len(scripts),";",sum(len(x.text) for x in scripts),"characters")
    if args.dry_run:
        for s in scripts:print(s.name,s.voice,len(s.text),"characters")
        return
    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro
    if not args.model.is_file() or not args.voices.is_file():
        ap.error("Download kokoro-v1.0.onnx and voices-v1.0.bin from thewh1teagle/kokoro-onnx model-files-v1.1")
    if not shutil.which("ffmpeg"):ap.error("FFmpeg must be installed")
    voice_engine=Kokoro(str(args.model),str(args.voices))
    AUDIO.mkdir(parents=True,exist_ok=True)
    for spec in scripts:
        target=AUDIO/(spec.name+".mp3")
        cues_target=AUDIO/(spec.name+".vtt")
        if target.exists() and cues_target.exists() and not args.overwrite:
            print("SKIP",target.name)
            continue
        chunks=paragraphs(spec.text)
        tracks=[];subtitles=[];offset=0.;sample_rate=None
        print("RENDER",spec.name,"segments",len(chunks),flush=True)
        for i,chunk in enumerate(chunks):
            segment,sr,timings=voice_engine.create_timed(chunk,voice=spec.voice,lang="en-us",speed=.94 if spec.name.startswith("male") else 1.)
            segment=np.asarray(segment,dtype="float32").ravel()
            if sample_rate and sample_rate!=sr:raise RuntimeError("Unexpected sample-rate change")
            sample_rate=sr
            length=len(segment)/sr
            subtitles.extend(subtitle_timing(spec.name,chunk,offset,length,timings))
            tracks.append(segment)
            offset+=length
            if i<len(chunks)-1:
                # The pause is explicit, legal original editorial pacing.
                pause=np.zeros(int(sr*.18),dtype="float32")
                tracks.append(pause)
                offset+=len(pause)/sr
        combined=np.concatenate(tracks)
        assert len(combined)>sample_rate*1, "Audio segment is unexpectedly empty"
        assert np.isfinite(combined).all(),"Non-finite samples"
        with tempfile.TemporaryDirectory() as tmp:
            wav=Path(tmp)/"speech.wav"
            sf.write(str(wav),combined,sample_rate,subtype="PCM_16")
            subprocess.run(["ffmpeg","-nostdin","-y","-hide_banner","-loglevel","error","-i",str(wav),
                "-af","loudnorm=I=-17:LRA=9:TP=-1.5","-codec:a","libmp3lame","-qscale:a","4",str(target)],check=True)
        # Protect against any zero-length or suspicious export.
        if target.stat().st_size<1000:raise RuntimeError(f"Encoded audio too small: {target}")
        lines=["WEBVTT",""]
        for i,(start,end,caption) in enumerate(subtitles):
            if end<=start:end=start+.08
            lines.extend([str(i+1),f"{timestamp(start)} --> {timestamp(end)}",caption,""])
        cues_target.write_text("\n".join(lines),encoding="utf-8")
        print("OK",spec.name,"seconds",round(offset,1),"bytes",target.stat().st_size,"cues",len(subtitles),flush=True)
    print("All requested clips completed; listen to every recording before claiming final voice quality.")

if __name__=="__main__":
    build()
