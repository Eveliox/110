# Room models

All models are from [Poly Haven](https://polyhaven.com) and released under CC0. They were
downloaded at 1K texture resolution and compressed (meshopt geometry, WebP textures) with
`gltf-transform optimize`.

| File | Asset | Author |
| --- | --- | --- |
| mid_century_lounge_chair.glb | [Mid Century Lounge Chair](https://polyhaven.com/a/mid_century_lounge_chair) | Kuutti Siitonen |
| modern_coffee_table_01.glb | [Modern Coffee Table 01](https://polyhaven.com/a/modern_coffee_table_01) | Amin |
| potted_plant_02.glb | [Potted Plant 02](https://polyhaven.com/a/potted_plant_02) | Rico Cilliers |
| potted_plant_04.glb | [Potted Plant 04](https://polyhaven.com/a/potted_plant_04) | James Ray Cock |
| metal_toolbox.glb | [Metal Toolbox](https://polyhaven.com/a/metal_toolbox) | Mateusz Sadek |
| tire_pump.glb | [Tire Pump](https://polyhaven.com/a/tire_pump) | Garrison Gager |
| modern_arm_chair_01.glb | [Modern Arm Chair 01](https://polyhaven.com/a/modern_arm_chair_01) | Vibrant Nordic |
| ceramic_vase_01.glb | [Ceramic Vase 01](https://polyhaven.com/a/ceramic_vase_01) | James Ray Cock |
| ceramic_vase_03.glb | [Ceramic Vase 03](https://polyhaven.com/a/ceramic_vase_03) | James Ray Cock |
| dartboard.glb | [Dartboard](https://polyhaven.com/a/dartboard) | Satyaki Mandal |
| metal_stool_01.glb | [Metal Stool 01](https://polyhaven.com/a/metal_stool_01) | Ulan Cabanilla |
| outdoor_table_chair_set_01.glb | [Outdoor Table Chair Set 01](https://polyhaven.com/a/outdoor_table_chair_set_01) | James Ray Cock |
| planter_box_01.glb | [Planter Box 01](https://polyhaven.com/a/planter_box_01) | James Ray Cock |
| modern_wooden_cabinet.glb | [Modern Wooden Cabinet](https://polyhaven.com/a/modern_wooden_cabinet) | Patrik Pangerl |
| ottoman_01.glb | [Ottoman 01](https://polyhaven.com/a/Ottoman_01) | Caspian Fortune |

# Floor detection model

"Try in my photo" finds the floor with [SlimSAM](https://github.com/czg1225/SlimSAM), a
compressed [Segment Anything](https://segment-anything.com) model, released under the Apache
License 2.0. It runs in the visitor's browser through
[Transformers.js](https://github.com/huggingface/transformers.js) (Apache-2.0). The ONNX weights
are [Xenova/slimsam-77-uniform](https://huggingface.co/Xenova/slimsam-77-uniform), pinned to
revision `5850ab45f587c112167512ffef949107115e26a0` in `lib/floor-segment.worker.ts`; they are
downloaded from Hugging Face on first use and are not stored in this repository. Photos are
never uploaded.

SegFormer models trained on ADE20K were considered and rejected: NVIDIA's SegFormer license
permits non-commercial use only.
