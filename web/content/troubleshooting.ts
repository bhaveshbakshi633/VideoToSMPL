export interface TroubleshootItem {
  id: string;
  tag: string;
  question: string;
  answer: string;
  fix?: string;
}

export const troubleshooting: TroubleshootItem[] = [
  {
    id: "cuda-oom",
    tag: "runtime · colab · local",
    question: "RuntimeError: CUDA out of memory during GVHMR",
    answer:
      "GVHMR needs ~6 GB VRAM. On free Colab T4 you sometimes get a GPU that's already half-allocated. Restart the runtime and try again, or downsample your input video to 720p.",
    fix: "ffmpeg -i input.mp4 -vf scale=-2:720 -c:v libx264 -crf 20 input_720p.mp4",
  },
  {
    id: "weights-404",
    tag: "setup · local",
    question: "Model weight downloads fail with HTTP 404 / 401",
    answer:
      "The HuggingFace mirror paths move occasionally. Verify each URL, and if any 404s, check the GVHMR repo's current INSTALL.md for the latest weights source.",
    fix: `ls -lh GVHMR/inputs/checkpoints/gvhmr/gvhmr_siga24_release.ckpt
# Expect ~500 MB. If missing or 0 bytes, re-download manually from HuggingFace.`,
  },
  {
    id: "conda-env-conflict",
    tag: "setup · local",
    question: "Import errors across environments (e.g. torchvision mismatch)",
    answer:
      "The gvhmr, gmr, and beyondmimic conda envs pin different torch/CUDA versions. Never install packages from one env into another — every subprocess call in the wrapper passes the correct python binary per stage.",
    fix: "conda deactivate && conda activate gvhmr   # before running GVHMR\nconda deactivate && conda activate gmr     # before running GMR",
  },
  {
    id: "robot-upside-down",
    tag: "retarget",
    question: "Retargeted G1 is upside-down or tilted 90°",
    answer:
      "You're almost certainly using the NLF path without the post-FK Rx(-90°) correction, or GVHMR with the rotation applied twice. GVHMR's camera-to-world rotation is built into GMR's loader — do not apply it again manually.",
    fix: `# GVHMR path: DON'T manually rotate — GMR handles it.
# NLF path: apply Rx(-90°) AFTER SMPL-X FK, not before.`,
  },
  {
    id: "motion-jittery",
    tag: "retarget · sanitize",
    question: "Retargeted motion looks jittery / has velocity spikes",
    answer:
      "NLF per-frame detections produce noise. Run the sanitizer — it applies iterative SavGol smoothing until the max joint velocity fits under 300°/s. GVHMR output is already temporal so usually needs less smoothing.",
    fix: "python -m core.sanitize --input raw.pkl --output clean.pkl --max_vel 300",
  },
  {
    id: "floating-root",
    tag: "retarget · sanitize",
    question: "Robot floats above or clips through the ground",
    answer:
      "SMPL's root pose is in camera coordinates; after retarget the feet aren't at z=0. The sanitizer does per-frame MuJoCo FK and shifts the root so the lowest foot is at the ground + 5 mm margin.",
    fix: "python -m core.sanitize --input raw.pkl --output grounded.pkl",
  },
  {
    id: "colab-clone-private",
    tag: "colab · auth",
    question: "Colab can't clone the private repo",
    answer:
      "Notebooks are self-contained — they clone only the public GVHMR and GMR repos. Your private code is inlined as notebook cells at build time by scripts/build_notebooks.py, so Colab never needs access to this private repo.",
  },
  {
    id: "multi-person",
    tag: "extraction",
    question: "NLF/GVHMR switches between people mid-video",
    answer:
      "Both models track the highest-confidence detection per frame. If your video has multiple people, crop to the subject first, or enforce a single-person track with a custom detection gate.",
    fix: "ffmpeg -i multi.mp4 -filter:v \"crop=in_w/2:in_h:0:0\" -c:v libx264 cropped.mp4",
  },
  {
    id: "mujoco-render-black",
    tag: "render",
    question: "Rendered MP4 is black or shows only the floor",
    answer:
      "Off-screen MuJoCo rendering needs EGL. On headless servers set the platform; on WSL with GPU passthrough sometimes you need an X11 display.",
    fix: "export MUJOCO_GL=egl   # headless\n# or\nexport MUJOCO_GL=osmesa # no GPU",
  },
  {
    id: "ffmpeg-missing",
    tag: "setup",
    question: "imageio complains about missing ffmpeg",
    answer:
      "Install system ffmpeg — imageio-ffmpeg ships a binary but some platforms miss shared libs.",
    fix: "sudo apt install -y ffmpeg   # Ubuntu/Debian\nbrew install ffmpeg          # macOS",
  },
  {
    id: "slow-iteration",
    tag: "performance",
    question: "Full pipeline takes >5 minutes per video",
    answer:
      "GVHMR is the bottleneck (~1–2 min/video on T4). Retarget + sanitize + render is <30 s combined. To iterate faster, reuse cached .pt files and only re-run downstream stages.",
    fix: "python run_pipeline.py --gvhmr_pt cached/video.pt   # skip extraction",
  },
  {
    id: "gvhmr-missing-script",
    tag: "setup",
    question: "FileNotFoundError: GVHMR/tools/demo/demo.py",
    answer:
      "You haven't cloned GVHMR, or GMR_PATH/GVHMR_PATH env vars point to a wrong directory. The wrappers resolve paths lazily — check them.",
    fix: "export GVHMR_PATH=$HOME/Projects/IL/GVHMR\nexport GMR_PATH=$HOME/Projects/IL/GMR",
  },
];
