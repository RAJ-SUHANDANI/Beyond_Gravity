# Kokoro voice and synthesis attribution

This independent educational project renders its original narration using
[Kokoro 82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache License 2.0),
via [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) (MIT License).

Default voices are `am_michael` (male scientific narrator) and `af_heart`
(female interaction guide), which are model-distributed synthetic voices.
No celebrity or living person's voice was cloned. The model data came from
published permissively licensed sources; consult the upstream model card
and VOICES.md for voice origins and relevant acknowledgements.

Output is synthetic audio, not a human actor. It should be reviewed for
prosody, accurate scientific pronunciation, clipping and factual alignment.
Do not describe it as a real person's voice.

Render or rerender the complete narration locally using:
```bash
python3 -m pip install 'kokoro-onnx>=0.6.0' numpy soundfile
curl -fLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/kokoro-v1.0.onnx
curl -fLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/voices-v1.0.bin
python3 tools/render_kokoro.py --dry-run
python3 tools/render_kokoro.py
```
Requires local FFmpeg. The source code is static; visitors download only the
audio for the chapter they are playing, not the model weights.
