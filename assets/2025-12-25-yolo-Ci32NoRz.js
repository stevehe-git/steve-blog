const n=`---
title: yolo安全帽检测流程
description: 系统环境为ubuntu20.04，16GB运行内存，无GPU，详细讲解linux系统如何利用cpu进行yolo训练安全帽检测模型
categoryKey: deepLearning
tag: 深度学习
badge: 深度学习
date: 2025-12-25
platform: Wechat
cover: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
filename: 2025-12-25-yolo.md
---

# 本机环境
\`\`\`
# 系统信息
Linux fjdynamics 5.15.0-130-generic #140~20.04.1-Ubuntu SMP Wed Dec 18 21:35:34 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux
Distributor ID:	Ubuntu
Description:	Ubuntu 20.04.6 LTS

# CPU 信息
CPU(s):                               8
On-line CPU(s) list:                  0-7
Thread(s) per core:                   2
Model name:                           11th Gen Intel(R) Core(TM) i7-1165G7 @ 2.80GHz
NUMA node0 CPU(s):                    0-7

# 内存信息
              total        used        free      shared  buff/cache   available
Mem:           15Gi       8.8Gi       2.0Gi       425Mi       4.6Gi       5.9Gi
Swap:          14Gi       991Mi        13Gi

# Python 信息
Python 3.8.10
/home/steve/Desktop/debug_python/yolo_cpu/bin/python

# 关键Python包
numpy                      1.24.4     
opencv-python              4.12.0.88  
torch                      2.4.1      
torchvision                0.19.1     
ultralytics                8.3.241    
ultralytics-thop           2.0.18 

# PyTorch/YOLO 信息
PyTorch: 2.4.1+cu121, CUDA: False
8.3.241
\`\`\`
# 环境准备（Linux + CPU）
## 1. 基础依赖安装
\`\`\`
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础依赖
sudo apt install -y python3 python3-pip python3-dev git wget unzip
\`\`\`

## 2. 创建虚拟环境（推荐）
\`\`\`
# 安装虚拟环境工具
pip3 install virtualenv
# 创建虚拟环境（命名为yolo_cpu）
virtualenv -p python3 yolo_cpu

# 激活虚拟环境
source yolo_cpu/bin/activate
\`\`\`
## 3. 安装 YOLO 依赖（CPU 版本）
以 YOLOv8（Ultralytics 版本）为例（CPU 友好、易用性高），安装核心依赖：
\`\`\`
# 安装 ultralytics（YOLOv8 核心库）
pip install ultralytics

# 安装标注工具依赖（LabelImg）
pip install labelImg

# 安装其他辅助依赖（数据处理、可视化）
pip install opencv-python pandas numpy matplotlib pillow
\`\`\`

# 二、数据标注（LabelImg 工具）
## 1. 数据准备
首先整理你的数据集，建议按以下目录结构组织：
\`\`\`
my_yolo_dataset/
├── images/          # 存放所有图片（训练+验证）
│   ├── train/       # 训练集图片
│   └── val/         # 验证集图片
└── labels/          # 存放标注文件（训练+验证）
    ├── train/       # 训练集标注文件
    └── val/         # 验证集标注文件
\`\`\`
- 图片格式推荐：JPG/PNG，命名规范（如 img_001.jpg）。
- 手动将图片按 8:2 比例划分到 train 和 val 目录。
## 2. 启动 LabelImg 标注
\`\`\`
# 激活虚拟环境后启动 LabelImg
labelImg

\`\`\`
## 3. 标注步骤（核心）
1. 设置标注格式：打开 LabelImg 后，点击顶部 View → 勾选 Auto Save Mode（自动保存），再点击 Format → 选择 YOLO（关键！YOLO 标注格式）。
2. 加载图片目录：点击 Open Dir，选择 my_yolo_dataset/images/train 目录。
3. 标注目标：
- 点击左侧 Create RectBox（快捷键 W），框选图片中的目标物体。
- 输入类别名称（如 cat、dog，注意类别名称要统一、无空格）。
- 标注完成后，点击 Save（快捷键 Ctrl+S），标注文件会自动保存为 .txt 格式，路径与图片对应（需手动将标注文件移动到 labels/train 目录）
4. 批量标注：点击 Next Image（快捷键 D），继续标注下一张图片；验证集图片同理，标注后保存到 labels/val 目录。

## 4. YOLO 标注文件格式说明
每个 .txt 标注文件对应一张图片，格式为：
\`\`\`
<类别ID> <中心点x> <中心点y> <宽度> <高度>
\`\`\`
- 类别 ID：从 0 开始的整数（如 0=cat，1=dog）。
- 中心点 x/y、宽度 / 高度：均为归一化值（除以图片宽 / 高，范围 0-1），LabelImg 会自动计算，无需手动修改。
# 三、配置数据集（关键）
## 1. 创建类别配置文件
在 my_yolo_dataset 目录下创建 classes.txt，每行一个类别名称（与标注时一致）：
\`\`\`
cat
dog
\`\`\`
## 2. 创建 YOLO 数据集配置文件
创建 dataset.yaml 文件，内容如下（替换为你的实际路径）：
\`\`\`
# 数据集配置文件
# 类别数
nc: 2
# 类别名称（与 classes.txt 一致）
names: ['cat', 'dog']

# 训练集/验证集图片路径（绝对路径/相对路径均可）
train: /home/your_username/my_yolo_dataset/images/train
val: /home/your_username/my_yolo_dataset/images/val

# 标注文件路径（可选，YOLO 会自动匹配图片对应的 labels 目录）
# 如果 labels 与 images 同级，无需额外配置
\`\`\`
# 四、CPU 训练 YOLOv8 模型
## 1. 训练命令（纯 CPU）
激活虚拟环境后，执行以下命令（核心参数已适配 CPU）：
\`\`\`
# YOLOv8n 是最小模型，CPU 训练速度最快；其他模型如 YOLOv8s/m/l 需更多算力
yolo detect train \\
  data=/home/your_username/my_yolo_dataset/dataset.yaml \\
  model=yolov8n.pt \\
  epochs=50 \\          # 训练轮数（CPU 建议 30-100，根据数据量调整）
  batch=8 \\            # 批次大小（CPU 建议 4-8，避免内存溢出）
  imgsz=640 \\          # 输入图片尺寸（默认 640，越小训练越快）
  device=cpu \\         # 强制使用 CPU（关键！）
  patience=10 \\        # 早停机制（验证集精度不提升则停止）
  save=True \\          # 保存模型
  project=my_yolo_train \\  # 训练结果保存目录
  name=yolov8n_cpu \\       # 模型名称
\`\`\`
## 2. 训练过程说明
- 首次运行会自动下载 YOLOv8n 预训练权重（约 6MB），无需手动下载。
- CPU 训练速度较慢（单张图片推理约 0.5-2 秒，训练 50 轮可能需要几十分钟到几小时，取决于数据量）。
- 训练过程中会实时显示损失值、mAP（平均精度）等指标，验证集 mAP 越高，模型效果越好。
- 训练完成后，结果会保存在 my_yolo_train/yolov8n_cpu 目录下，核心文件：
   - weights/best.pt：验证集效果最好的模型。
   - weights/last.pt：最后一轮训练的模型。
   - results.csv：训练指标记录（可用于可视化）。

# 五、CPU 推理（模型测试）
## 1. 单张图片推理
\`\`\`
yolo detect predict \\
  model=my_yolo_train/yolov8n_cpu/weights/best.pt \\
  source=/home/your_username/test_img.jpg \\  # 测试图片路径
  device=cpu \\
  save=True  # 保存推理结果图片
\`\`\`
## 2. 批量图片 / 视频推理
\`\`\`
# 批量图片
yolo detect predict model=best.pt source=/path/to/test_images device=cpu

# 视频推理（CPU 速度较慢，建议短视频）
yolo detect predict model=best.pt source=/path/to/test_video.mp4 device=cpu
\`\`\`
## 3. 推理结果说明
- 推理结果图片会保存在 runs/detect/predict 目录下，标注出目标的类别、置信度和边界框。
- 终端会输出每个目标的类别、置信度、坐标等信息。

# 六、常见问题与优化（CPU 专属）
## 1. 训练速度慢：
- 减小 imgsz（如 480/320）、降低 batch（如 4）。
- 使用更小的模型（YOLOv8n < YOLOv8s < YOLOv8m）。
- 减少训练轮数（epochs），或使用更小的数据集。
## 2. 内存溢出：
- 降低 batch 到 2 或 1。
- 清理系统内存（关闭其他程序）。
## 3. 标注格式错误：
- 检查类别 ID 是否从 0 开始，标注值是否归一化（0-1）。
- 确保 dataset.yaml 中的路径、类别数、类别名称与实际一致。

# 七、总结
- 核心流程：Linux 环境搭建（CPU 依赖）→ LabelImg 标注数据（YOLO 格式）→ 配置 dataset.yaml → CPU 训练 YOLOv8 模型 → 推理测试。
- CPU 关键参数：训练时指定 device=cpu，降低 batch 和 imgsz 避免内存溢出，优先使用 YOLOv8n 轻量模型。
- 标注核心：确保类别名称统一、标注文件路径与图片匹配、标注格式为 YOLO 归一化格式。`;export{n as default};
