/**
 * 教材模板数据
 * 参考各主流教材版本的真实目录结构，内容适当简化
 */

export interface TextbookChapter {
  id: string;
  title: string;
  topics: string[];
  keyPoints: string[];
  duration: number; // 建议时长（分钟）
}

export interface TextbookTemplate {
  id: string;
  name: string;
  subject: string;
  grade: string;
  publisher: string;
  coverIcon: string;
  chapters: TextbookChapter[];
}

export const textbookTemplates: TextbookTemplate[] = [
  // ─── 人教版 高一生物 必修1 ───
  {
    id: "pep-biology-g1-v1",
    name: "生物学 · 分子与细胞",
    subject: "biology",
    grade: "高一",
    publisher: "人教版",
    coverIcon: "Dna",
    chapters: [
      {
        id: "c1", title: "走进细胞", topics: ["细胞是生命活动的基本单位", "细胞的多样性和统一性", "原核细胞与真核细胞"], keyPoints: ["细胞学说的建立过程", "显微镜观察细胞的方法"], duration: 8,
      },
      {
        id: "c2", title: "组成细胞的分子", topics: ["细胞中的元素和化合物", "蛋白质", "核酸", "糖类和脂质", "水和无机盐"], keyPoints: ["蛋白质是生命活动的主要承担者", "核酸是遗传信息的携带者"], duration: 12,
      },
      {
        id: "c3", title: "细胞的基本结构", topics: ["细胞膜的结构和功能", "细胞器——系统内的分工合作", "细胞核——系统的控制中心"], keyPoints: ["生物膜系统的结构与功能", "细胞器之间的协调配合"], duration: 10,
      },
      {
        id: "c4", title: "细胞的物质输入和输出", topics: ["被动运输", "主动运输", "物质跨膜运输的方式"], keyPoints: ["自由扩散与协助扩散的区别", "主动运输需要消耗能量"], duration: 8,
      },
      {
        id: "c5", title: "细胞的能量供应和利用", topics: ["降低化学反应活化能的酶", "细胞的能量通货——ATP", "ATP的主要来源——细胞呼吸", "能量之源——光与光合作用"], keyPoints: ["酶的特性与影响酶活性的因素", "光合作用的光反应与暗反应"], duration: 15,
      },
      {
        id: "c6", title: "细胞的生命历程", topics: ["细胞增殖", "细胞的分化", "细胞的衰老和凋亡", "细胞的癌变"], keyPoints: ["有丝分裂的过程与各期特征", "细胞凋亡与坏死的区别"], duration: 10,
      },
    ],
  },

  // ─── 人教版 高一数学 必修1 ───
  {
    id: "pep-math-g1-v1",
    name: "数学 · 必修第一册",
    subject: "math",
    grade: "高一",
    publisher: "人教版",
    coverIcon: "Calculator",
    chapters: [
      {
        id: "c1", title: "集合与常用逻辑用语", topics: ["集合的概念", "集合间的基本关系", "集合的基本运算", "充分条件与必要条件"], keyPoints: ["集合的交并补运算", "充要条件的判断方法"], duration: 10,
      },
      {
        id: "c2", title: "一元二次函数、方程和不等式", topics: ["等式性质与不等式性质", "基本不等式", "二次函数与一元二次方程", "一元二次不等式"], keyPoints: ["基本不等式求最值", "二次函数的图像与性质"], duration: 12,
      },
      {
        id: "c3", title: "函数的概念与性质", topics: ["函数的概念", "函数的表示方法", "函数的单调性", "函数的最大（小）值", "函数的奇偶性"], keyPoints: ["函数单调性的证明方法", "奇偶性的判断与图像特征"], duration: 15,
      },
      {
        id: "c4", title: "指数函数与对数函数", topics: ["指数", "指数函数", "对数", "对数函数"], keyPoints: ["指数函数的图像与性质", "对数运算法则", "换底公式"], duration: 14,
      },
      {
        id: "c5", title: "三角函数", topics: ["任意角和弧度制", "三角函数的概念", "三角函数的图像与性质", "三角恒等变换", "函数y=Asin(ωx+φ)的图像"], keyPoints: ["三角函数的图像变换", "两角和差公式"], duration: 15,
      },
      {
        id: "c6", title: "数列", topics: ["数列的概念与简单表示法", "等差数列", "等比数列", "数列求和方法"], keyPoints: ["等差/等比数列的通项公式与前n项和", "裂项相消法求和"], duration: 12,
      },
    ],
  },

  // ─── 人教版 高一物理 必修1 ───
  {
    id: "pep-physics-g1-v1",
    name: "物理 · 必修第一册",
    subject: "physics",
    grade: "高一",
    publisher: "人教版",
    coverIcon: "Zap",
    chapters: [
      {
        id: "c1", title: "运动的描述", topics: ["质点 参考系", "时间和位移", "位置变化快慢的描述——速度", "速度变化快慢的描述——加速度"], keyPoints: ["位移与路程的区别", "加速度的物理意义"], duration: 10,
      },
      {
        id: "c2", title: "匀变速直线运动的研究", topics: ["实验：探究小车速度随时间变化的规律", "匀变速直线运动的速度与时间的关系", "匀变速直线运动的位移与时间的关系", "自由落体运动"], keyPoints: ["v-t图像的斜率与面积含义", "自由落体的运动规律"], duration: 12,
      },
      {
        id: "c3", title: "牛顿第一定律", topics: ["牛顿第一定律", "惯性与质量"], keyPoints: ["力不是维持运动的原因", "惯性与质量的关系"], duration: 6,
      },
      {
        id: "c4", title: "牛顿第二定律", topics: ["探究加速度与力、质量的关系", "牛顿第二定律", "力学单位制"], keyPoints: ["F=ma的实验验证", "受力分析与运动分析的关联"], duration: 10,
      },
      {
        id: "c5", title: "牛顿第三定律", topics: ["力的作用是相互的", "牛顿第三定律", "牛顿力学的局限性"], keyPoints: ["作用力与反作用力的关系", "平衡力与作用力的区别"], duration: 8,
      },
      {
        id: "c6", title: "力的合成与分解", topics: ["力的合成", "力的分解", "矢量和标量", "共点力的平衡条件"], keyPoints: ["平行四边形定则", "正交分解法求合力"], duration: 10,
      },
    ],
  },

  // ─── 人教版 高三语文 ───
  {
    id: "pep-chinese-g3",
    name: "语文 · 高考总复习",
    subject: "chinese",
    grade: "高三",
    publisher: "人教版",
    coverIcon: "ScrollText",
    chapters: [
      {
        id: "c1", title: "古诗词鉴赏", topics: ["诗歌的形象与意象", "诗歌的表达技巧", "诗歌的语言风格", "情感主旨的把握"], keyPoints: ["常见意象的象征意义", "对比、衬托、虚实结合等手法"], duration: 12,
      },
      {
        id: "c2", title: "文言文阅读", topics: ["文言实词与虚词", "文言句式", "文言文翻译技巧", "文章内容的理解与分析"], keyPoints: ["120个常见文言实词", "判断句、被动句、倒装句、省略句"], duration: 14,
      },
      {
        id: "c3", title: "现代文阅读（论述类/实用类）", topics: ["论述类文本阅读方法", "实用类文本阅读", "信息的筛选与整合", "论证分析与评价"], keyPoints: ["论点、论据、论证的关系", "常见论证方法"], duration: 10,
      },
      {
        id: "c4", title: "文学类文本阅读", topics: ["小说的情节与结构", "人物形象分析", "环境描写的作用", "主题与意蕴的探究"], keyPoints: ["多角度分析人物形象", "环境描写的烘托作用"], duration: 10,
      },
      {
        id: "c5", title: "名篇名句默写与语言文字运用", topics: ["必背古诗文", "成语运用", "病句辨析与修改", "语言表达连贯得体"], keyPoints: ["常见病句类型", "补写语句的逻辑关系"], duration: 8,
      },
      {
        id: "c6", title: "作文写作提升", topics: ["议论文写作结构", "论据的选择与运用", "论证方法与逻辑", "作文审题与立意", "考场作文得分技巧"], keyPoints: ["并列式、递进式、对比式论证结构", "素材积累与灵活运用"], duration: 15,
      },
    ],
  },

  // ─── 北师大版 高一化学 必修1 ───
  {
    id: "bsnu-chemistry-g1-v1",
    name: "化学 · 必修第一册",
    subject: "chemistry",
    grade: "高一",
    publisher: "北师大版",
    coverIcon: "FlaskConical",
    chapters: [
      {
        id: "c1", title: "物质的分类与转化", topics: ["物质的分类方法", "单质与化合物", "酸碱盐氧化物", "化学反应的类型"], keyPoints: ["物质分类的树状图法", "四大基本反应类型"], duration: 8,
      },
      {
        id: "c2", title: "物质的量", topics: ["物质的量的概念", "摩尔质量", "气体摩尔体积", "物质的量浓度", "一定物质的量浓度溶液的配制"], keyPoints: ["n=m/M 的灵活运用", "溶液配制的实验步骤"], duration: 12,
      },
      {
        id: "c3", title: "离子反应", topics: ["电解质与非电解质", "离子方程式的书写", "离子共存问题", "离子反应的本质"], keyPoints: ["离子方程式的书写规则", "判断离子共存的四种情况"], duration: 10,
      },
      {
        id: "c4", title: "氧化还原反应", topics: ["氧化还原反应的本质", "氧化剂与还原剂", "氧化还原反应方程式的配平", "氧化还原反应的应用"], keyPoints: ["电子转移的表示方法", "常见氧化剂和还原剂"], duration: 12,
      },
      {
        id: "c5", title: "钠及其化合物", topics: ["钠的性质", "钠的氧化物", "碳酸钠与碳酸氢钠", "焰色反应"], keyPoints: ["Na₂O与Na₂O₂的区别", "Na₂CO₃与NaHCO₃的转化与鉴别"], duration: 8,
      },
      {
        id: "c6", title: "铁及其化合物", topics: ["铁的单质性质", "Fe²⁺与Fe³⁺的相互转化", "铁的重要化合物", "金属冶炼的一般原理"], keyPoints: ["Fe²⁺与Fe³⁺的检验方法", "铝热反应的原理"], duration: 8,
      },
    ],
  },

  // ─── 人教版 高一英语 ───
  {
    id: "pep-english-g1-v1",
    name: "英语 · 必修第一册",
    subject: "english",
    grade: "高一",
    publisher: "人教版",
    coverIcon: "Languages",
    chapters: [
      {
        id: "c1", title: "Teenage Life", topics: ["School life in different countries", "Extracurricular activities", "Volunteer work", "Teenage challenges"], keyPoints: ["表达建议与观点", "定语从句入门"], duration: 10,
      },
      {
        id: "c2", title: "Travelling Around", topics: ["Travel destinations", "Planning a trip", "Travel journals", "Cultural experiences"], keyPoints: ["将来时态表达计划", "现在分词作状语"], duration: 10,
      },
      {
        id: "c3", title: "Sports and Fitness", topics: ["Sports events", "Healthy lifestyle", "Olympic spirit", "Fitness and well-being"], keyPoints: ["被动语态的构成与用法", "健康话题高频词汇"], duration: 10,
      },
      {
        id: "c4", title: "History and Traditions", topics: ["Traditional festivals", "Historical landmarks", "Cultural heritage", "Family traditions"], keyPoints: ["限制性定语从句 vs 非限制性定语从句", "文化类写作模板"], duration: 10,
      },
      {
        id: "c5", title: "Languages Around the World", topics: ["Language diversity", "Learning strategies", "Chinese language and culture", "Body language"], keyPoints: ["动名词的用法", "跨文化交际"], duration: 10,
      },
    ],
  },
];

/**
 * 获取所有可选的学科列表
 */
export function getTemplateSubjects(): string[] {
  return [...new Set(textbookTemplates.map((t) => t.subject))];
}

/**
 * 获取所有可选的出版社列表
 */
export function getTemplatePublishers(): string[] {
  return [...new Set(textbookTemplates.map((t) => t.publisher))];
}

/**
 * 获取所有可选的年级列表
 */
export function getTemplateGrades(): string[] {
  return [...new Set(textbookTemplates.map((t) => t.grade))];
}

/**
 * 根据条件筛选模板
 */
export function filterTemplates(filters: {
  subject?: string;
  grade?: string;
  publisher?: string;
  search?: string;
}): TextbookTemplate[] {
  let result = textbookTemplates;
  if (filters.subject) {
    result = result.filter((t) => t.subject === filters.subject);
  }
  if (filters.grade) {
    result = result.filter((t) => t.grade === filters.grade);
  }
  if (filters.publisher) {
    result = result.filter((t) => t.publisher === filters.publisher);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.publisher.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.grade.toLowerCase().includes(q)
    );
  }
  return result;
}

/**
 * 根据 ID 获取模板
 */
export function getTemplateById(id: string): TextbookTemplate | undefined {
  return textbookTemplates.find((t) => t.id === id);
}

const SUBJECT_LABELS: Record<string, string> = {
  biology: "生物", math: "数学", physics: "物理",
  chinese: "语文", chemistry: "化学", english: "英语",
};

export { SUBJECT_LABELS };
