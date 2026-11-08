// UDL 双语阅读资料章节注册表（batch.py 自动生成）
import ch1 from './ch1.json';
import ch2 from './ch2.json';
import ch3 from './ch3.json';
import ch4 from './ch4.json';
import ch5 from './ch5.json';
import ch6 from './ch6.json';
import ch7 from './ch7.json';
import ch8 from './ch8.json';
import ch9 from './ch9.json';
import ch10 from './ch10.json';
import ch11 from './ch11.json';
import ch12 from './ch12.json';
import ch13 from './ch13.json';
import ch14 from './ch14.json';
import ch15 from './ch15.json';
import ch16 from './ch16.json';
import ch17 from './ch17.json';
import ch18 from './ch18.json';
import ch19 from './ch19.json';
import ch20 from './ch20.json';
import ch21 from './ch21.json';
import ch22 from './ch22.json';
import ch23 from './ch23.json';
import ch24 from './ch24.json';

export interface UdlBlock {
  type: string;
  text?: string;
  latex?: string;
  img?: string;
  cont?: boolean;
}

export const UDL_CHAPTERS = [
  { id: 'ch1', num: 1, zhTitle: '引言', enTitle: 'Introduction', pages: (ch1 as any).sections },
  { id: 'ch2', num: 2, zhTitle: '监督学习', enTitle: 'Supervised learning', pages: (ch2 as any).sections },
  { id: 'ch3', num: 3, zhTitle: '浅层神经网络', enTitle: 'Shallow neural networks', pages: (ch3 as any).sections },
  { id: 'ch4', num: 4, zhTitle: '深度神经网络', enTitle: 'Deep neural networks', pages: (ch4 as any).sections },
  { id: 'ch5', num: 5, zhTitle: '损失函数', enTitle: 'Loss functions', pages: (ch5 as any).sections },
  { id: 'ch6', num: 6, zhTitle: '拟合模型', enTitle: 'Fitting models', pages: (ch6 as any).sections },
  { id: 'ch7', num: 7, zhTitle: '梯度与初始化', enTitle: 'Gradients and initialization', pages: (ch7 as any).sections },
  { id: 'ch8', num: 8, zhTitle: '衡量性能', enTitle: 'Measuring performance', pages: (ch8 as any).sections },
  { id: 'ch9', num: 9, zhTitle: '正则化', enTitle: 'Regularization', pages: (ch9 as any).sections },
  { id: 'ch10', num: 10, zhTitle: '卷积网络', enTitle: 'Convolutional networks', pages: (ch10 as any).sections },
  { id: 'ch11', num: 11, zhTitle: '残差网络', enTitle: 'Residual networks', pages: (ch11 as any).sections },
  { id: 'ch12', num: 12, zhTitle: 'Transformers', enTitle: 'Transformers', pages: (ch12 as any).sections },
  { id: 'ch13', num: 13, zhTitle: '图神经网络', enTitle: 'Graph neural networks', pages: (ch13 as any).sections },
  { id: 'ch14', num: 14, zhTitle: '无监督学习', enTitle: 'Unsupervised learning', pages: (ch14 as any).sections },
  { id: 'ch15', num: 15, zhTitle: '生成对抗网络', enTitle: 'Generative adversarial networks', pages: (ch15 as any).sections },
  { id: 'ch16', num: 16, zhTitle: '归一化流', enTitle: 'Normalizing flows', pages: (ch16 as any).sections },
  { id: 'ch17', num: 17, zhTitle: '变分自编码器', enTitle: 'Variational autoencoders', pages: (ch17 as any).sections },
  { id: 'ch18', num: 18, zhTitle: '扩散模型', enTitle: 'Diffusion models', pages: (ch18 as any).sections },
  { id: 'ch19', num: 19, zhTitle: '强化学习', enTitle: 'Reinforcement learning', pages: (ch19 as any).sections },
  { id: 'ch20', num: 20, zhTitle: '深度学习为何有效', enTitle: 'Why does deep learning work?', pages: (ch20 as any).sections },
  { id: 'ch21', num: 21, zhTitle: '深度学习与伦理', enTitle: 'Deep learning and ethics', pages: (ch21 as any).sections },
  { id: 'ch22', num: 22, zhTitle: '符号', enTitle: 'Notation', pages: (ch22 as any).sections },
  { id: 'ch23', num: 23, zhTitle: '数学', enTitle: 'Mathematics', pages: (ch23 as any).sections },
  { id: 'ch24', num: 24, zhTitle: '概率', enTitle: 'Probability', pages: (ch24 as any).sections },
];

export const UDL_META = {
  bookZh: '理解深度学习',
  bookEn: 'Understanding Deep Learning',
  author: 'Simon J.D. Prince',
  source: 'udlbook.com',
  license: 'CC BY-NC-ND 4.0（仅作个人学习笔记用途）',
};
