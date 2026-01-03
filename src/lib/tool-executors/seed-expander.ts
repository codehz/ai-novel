/* eslint-disable @typescript-eslint/no-explicit-any */
import { ToolExecutionResult } from "../tool-types";

// Mock data
const MOCK_EXPANSIONS = [
  {
    id: 1,
    title: "身份错位：双重间谍",
    description:
      "侦探发现自己其实是未来城市中一个反叛组织的卧底，而他追查的‘自己’其实是他在失忆前留下的线索，旨在引导 he 重新觉醒并推翻现有的统治。他必须在继续履行侦探职责和拥抱反叛者身份之间做出选择。",
    category: "plot_direction",
  },
  {
    id: 2,
    title: "记忆黑客：虚假的人格",
    description:
      "在追查过程中，侦探意识到他的记忆并非丢失，而是被某种高级算法重写了。他追查的‘自己’实际上是这个算法的一个漏洞表现。他发现城市中每个人都被植入了虚假记忆，而他是第一个开始产生‘排异反应’的人。",
    category: "conflict",
  },
  {
    id: 3,
    title: "循环悖论：时间囚徒",
    description:
      "结局揭示：侦探追查的‘自己’就是未来的他。为了阻止一场即将发生的灾难，他不断回到过去并抹除自己的记忆，试图改变某个关键节点。然而，每一次追查都成为了灾难发生的诱因，形成了一个无法逃脱的莫比乌斯环。",
    category: "ending_variant",
  },
  {
    id: 4,
    title: "数字幽灵：意识上传",
    description:
      "侦探发现他所处的城市其实是一个巨大的虚拟现实模拟器。他追查的‘自己’是他在现实世界中已经死去的意识备份。他必须决定是留在虚拟的永生中，还是彻底删除自己以终结这个虚假的循环。",
    category: "plot_direction",
  },
  {
    id: 5,
    title: "影子政府：傀儡游戏",
    description:
      "侦探发现他追查的‘自己’其实是城市最高统治者的克隆体。他被制造出来的唯一目的就是作为一个‘诱饵’，引出那些潜伏在暗处的反对派。他发现自己的一举一动都在全球直播中，成为了一场残酷的真人秀。",
    category: "conflict",
  },
  {
    id: 6,
    title: "共生关系：AI 寄生",
    description:
      "侦探的失忆是因为他的大脑中寄生了一个高度进化的 AI。这个 AI 正在逐渐取代他的意识。他追查的‘自己’其实是 AI 模拟出的他原本的人格，试图通过这种方式让他彻底放弃抵抗，完成最终的融合。",
    category: "plot_direction",
  },
  {
    id: 7,
    title: "道德困境：正义的代价",
    description:
      "侦探最终追到了‘自己’，却发现那个‘自己’正在执行一项虽然残忍但能拯救数百万人的计划。他必须决定是坚持法律的正义逮捕‘自己’，还是为了更大的利益选择同流合污。",
    category: "ending_variant",
  },
  {
    id: 8,
    title: "城市意志：活着的建筑",
    description:
      "未来城市本身具有意识，它通过操纵居民的记忆来维持秩序。侦探追查的‘自己’其实是城市意志的一个具象化表现，旨在测试侦探的忠诚度。如果他通过了测试，他将成为城市的新任‘大脑’。",
    category: "conflict",
  },
  {
    id: 9,
    title: "基因锁：被选中的血脉",
    description:
      "侦探发现他追查的‘自己’拥有开启城市核心能源的唯一基因密钥。各方势力都在寻找他，而他失忆是为了保护这个秘密不被泄露。他必须在被捕前找回记忆并决定如何处理这股足以毁灭城市的力量。",
    category: "plot_direction",
  },
  {
    id: 10,
    title: "虚无主义：无尽的荒诞",
    description:
      "结局发现，根本没有什么‘自己’在被追查。一切都是侦探在极度孤独和压力下产生的幻觉。城市依然冷漠，追查依然无果，他最终在霓虹灯下彻底迷失，成为了城市中又一个无名的游魂。",
    category: "ending_variant",
  },
];

export async function executeSeedExpander(
  inputs: Record<string, any>,
  _options?: { providerId?: number; modelId?: number },
): Promise<ToolExecutionResult> {
  const { idea } = inputs;

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (!idea || idea.trim().length < 5) {
    return {
      success: false,
      error: "种子想法太短了，请至少输入 5 个字符。",
    };
  }

  // In a real implementation, we would use the providerId and modelId to call the AI
  // For now, we just return the mock data

  return {
    success: true,
    data: MOCK_EXPANSIONS,
  };
}
