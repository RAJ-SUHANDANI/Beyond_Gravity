#!/usr/bin/env python3
"""Optional fully LOCAL natural neural-voice render pipeline for Beyond Gravity.

Prerequisites:
  pip install chatterbox-tts torchaudio
  ffmpeg available on PATH
  Obtain TWO reference samples that you OWN or have clear permission to use.
Usage:
  python tools/render_narration.py --male-ref voices/owned_male.wav --female-ref voices/owned_female.wav
Output:
  public/audio/male-00.mp3 ... male-11.mp3, female-*.mp3, female-intro.mp3
No cloud API, account or paid TTS is necessary. Running the model may require
a capable local GPU and initially downloading open model weights.
Do not clone a real person's voice without permission.
"""
import argparse
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "data.ts"
DEST = ROOT / "public" / "audio"

def scripts():
    text = SOURCE.read_text(encoding="utf-8")
    main = re.findall(r"narration:'(.*?)',tag:", text, re.DOTALL)
    parts = re.findall(r"id:'(body|fans|vessel|thrusters|wheels|computer)'.*?female:'(.*?)',principle:", text, re.DOTALL)
    if len(main) != 12 or len(parts) != 6:
        raise ValueError("Script parsing failed — chapter or component count changed. Update script extractor.")
    return [(f"male-{i:02d}", narration, "male") for i, narration in enumerate(main)] + [(f"female-{key}", line, "female") for key, line in parts] + [("female-intro", "Beyond Gravity. An interactive journey into the science of flying cars. Start the story, or explore the machine.", "female")]

def main():
    arg = argparse.ArgumentParser(description="Local documentary neural TTS rendering")
    arg.add_argument("--male-ref", required=True, type=Path, help="Voice sample with clear legal permission")
    arg.add_argument("--female-ref", required=True, type=Path, help="Voice sample with clear legal permission")
    arg.add_argument("--device", default="auto", help="auto, cuda or cpu")
    arg.add_argument("--overwrite", action="store_true")
    args = arg.parse_args()
    if not args.male_ref.is_file() or not args.female_ref.is_file():
        arg.error("Two locally owned/licensed reference recordings are required")
    try:
        import torch
        import torchaudio
        from chatterbox.tts import ChatterboxTTS
    except ImportError as e:
        raise SystemExit("Install optional TTS tools locally: pip install chatterbox-tts torchaudio") from e
    device = ("cuda" if torch.cuda.is_available() else "cpu") if args.device == "auto" else args.device
    print("Loading free open-source Chatterbox TTS on", device)
    model = ChatterboxTTS.from_pretrained(device=device)
    DEST.mkdir(parents=True, exist_ok=True)
    for name, line, kind in scripts():
        output = DEST / f"{name}.mp3"
        if output.exists() and not args.overwrite:
            print("Skipping existing", output.name)
            continue
        reference = str((args.male_ref if kind == "male" else args.female_ref).resolve())
        print("Rendering", name, "(", len(line), "characters )")
        with torch.inference_mode():
            wave = model.generate(line, audio_prompt_path=reference)
        with tempfile.TemporaryDirectory() as tmp:
            wav = Path(tmp) / "speech.wav"
            torchaudio.save(str(wav), wave.cpu(), model.sr)
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav),
                            "-af", "loudnorm=I=-17:LRA=7:TP=-1.5",
                            "-codec:a", "libmp3lame", "-qscale:a", "3", str(output)], check=True)
        print("Wrote", output)
    print("Finished. Verify every file by ear for consistency, pacing and pronunciations.")

if __name__ == "__main__":
    main()
