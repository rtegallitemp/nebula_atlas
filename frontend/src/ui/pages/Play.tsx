import { useState, useEffect, useRef, RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Sparkles, Flame, Zap, ArrowRight, X } from "lucide-react";
import { ethers } from "ethers";
import { FhevmInstance } from "../../web3/fhevm/fhevmTypes";
import { useNebulaAtlas } from "../../web3/hooks/useNebulaAtlas";
import { CountryCard } from "../components/CountryCard";

interface PlayProps {
  isConnected: boolean;
  fhevmInstance: FhevmInstance | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  chainId: number | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
}

const mockQuestions = [
  { id: 1, country: "中国", options: ["中国", "日本", "韩国", "蒙古"], difficulty: "easy", hint: "世界上人口最多的国家之一", explanation: "中国，首都北京，是世界四大文明古国之一。" },
  { id: 2, country: "法国", options: ["西班牙", "意大利", "法国", "德国"], difficulty: "medium", hint: "以埃菲尔铁塔闻名", explanation: "法国，首都巴黎，是欧洲浪漫之都。" },
  { id: 3, country: "巴西", options: ["阿根廷", "巴西", "智利", "秘鲁"], difficulty: "hard", hint: "南美洲最大的国家", explanation: "巴西，首都巴西利亚，足球王国。" }
];

export function Play({
  isConnected,
  fhevmInstance,
  ethersSigner,
  ethersReadonlyProvider,
  chainId,
  sameChain,
  sameSigner,
}: PlayProps) {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [streak, setStreak] = useState(0);

  const nebula = useNebulaAtlas({
    instance: fhevmInstance,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const question = mockQuestions[currentQuestion];
  const totalQuestions = mockQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  useEffect(() => {
    if (isAnswered) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion, isAnswered]);

  const handleTimeout = () => {
    setIsAnswered(true);
    setIsCorrect(false);
    setStreak(0);
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    const correct = answer === question.country;
    setIsCorrect(correct);
    
    if (correct) {
      const timeUsed = 30 - timeLeft;
      let points = 0;
      if (timeUsed <= 10) points = 3;
      else if (timeUsed <= 20) points = 2;
      else points = 1;
      if (showHint) points = Math.max(1, points - 1);
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(30);
      setShowHint(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setSubmitError(null);
    if (!isConnected) {
      setSubmitError("请先连接钱包后再上链。");
      return;
    }
    if (!nebula.contractAddress || !ethersSigner || !fhevmInstance) {
      setSubmitError("合约未就绪：请确认已部署到当前网络并切到正确链，且 FHEVM 已就绪。");
      return;
    }
    try {
      setSubmitting(true);
      const resultCID = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
      const resultHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify({ score })));
      const txHash = await nebula.submitOutcomeWith({
        score,
        scorePublic: score,
        resultCID,
        resultHash,
      });
      navigate("/result", {
        state: {
          score,
          totalQuestions,
          timeSpent: Math.floor((Date.now() - startTime) / 1000),
          txHash,
        },
      });
    } catch (e: any) {
      console.error("Submit failed:", e);
      setSubmitError(`上链失败：${e?.message ?? String(e)}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center pl-20">
        <div className="neon-card max-w-md w-full">
          <div className="neon-card-inner p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gradient-pink mb-4">
              连接以开始征途
            </h2>
            <p className="text-gray-400 mb-8">
              连接你的钱包，开启星际探索之旅
            </p>
            <button
              onClick={() => {}}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl font-semibold text-white hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              连接钱包
            </button>
          </div>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    easy: "from-green-500 to-emerald-500",
    medium: "from-yellow-500 to-orange-500",
    hard: "from-red-500 to-rose-500"
  };

  return (
    <div className="min-h-screen pl-20 pr-8 py-8 flex items-center justify-center">
      {/* 背景光斑 */}
      <div className="glow-orb w-96 h-96 bg-pink-500 -top-48 -left-48"></div>
      <div className="glow-orb w-96 h-96 bg-purple-500 -bottom-48 -right-48"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* 左侧：状态面板 */}
        <div className="space-y-6">
          {/* 得分 */}
          <div className="neon-card">
            <div className="neon-card-inner p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">当前得分</span>
                <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500' : 'text-gray-600'}`} />
              </div>
              <div className="text-5xl font-bold text-gradient-pink mb-2">{score}</div>
              {streak > 1 && (
                <div className="text-sm text-orange-400 animate-pulse">
                  🔥 连续答对 {streak} 题！
                </div>
              )}
            </div>
          </div>

          {/* 进度 */}
          <div className="neon-card">
            <div className="neon-card-inner p-6">
              <div className="text-gray-400 text-sm mb-3">征途进度</div>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl font-bold text-white">
                  {currentQuestion + 1}
                </div>
                <div className="text-gray-500 text-2xl">/</div>
                <div className="text-2xl text-gray-400">
                  {totalQuestions}
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 计时器 */}
          <div className="neon-card">
            <div className="neon-card-inner p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className={`w-6 h-6 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`} />
                <span className="text-gray-400 text-sm">剩余时间</span>
              </div>
              <div className={`text-5xl font-bold ${timeLeft <= 10 ? 'text-red-500 scale-pulse' : 'text-white'}`}>
                {timeLeft}s
              </div>
              <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    timeLeft <= 10 ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                  }`}
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 中间：问题卡片 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 难度标签 */}
          <div className="flex items-center justify-between">
            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${difficultyColors[question.difficulty as keyof typeof difficultyColors]} text-white font-bold text-sm inline-block`}>
              {question.difficulty === "easy" ? "简单" : question.difficulty === "medium" ? "中等" : "困难"}
            </div>
            {!isAnswered && (
              <button
                onClick={() => setShowHint(true)}
                className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/30 transition-colors duration-300 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {showHint ? question.hint : "显示提示 (-1分)"}
              </button>
            )}
          </div>

          {/* 问题主卡片 */}
          <div className="neon-card">
            <div className="neon-card-inner p-10">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">
                这是哪个国家？
              </h2>

              {/* 国家地图 */}
              <div className="mb-8">
                <CountryCard 
                  countryName={question.country} 
                  revealed={isAnswered}
                />
              </div>

              {/* 选项网格 - 四个角飞入 */}
              <div className="grid grid-cols-2 gap-4">
                {question.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = option === question.country;
                  const showResult = isAnswered;
                  const animations = ['animate-fly-in-1', 'animate-fly-in-2', 'animate-fly-in-3', 'animate-fly-in-4'];

                  let btnClasses = `relative p-6 rounded-2xl font-bold text-lg transition-all duration-300 ${animations[idx]} `;

                  if (!showResult) {
                    btnClasses += isSelected
                      ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white scale-105'
                      : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:scale-105 hover:shadow-xl';
                  } else {
                    if (isCorrectAnswer) {
                      btnClasses += 'bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-pulse';
                    } else if (isSelected && !isCorrectAnswer) {
                      btnClasses += 'bg-gradient-to-br from-red-500 to-rose-600 text-white shake';
                    } else {
                      btnClasses += 'bg-gray-800/30 text-gray-600';
                    }
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      disabled={isAnswered}
                      className={btnClasses}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <span className="relative z-10">{option}</span>
                      {showResult && isCorrectAnswer && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-white" fill="currentColor" />
                          </div>
                        </div>
                      )}
                      {showResult && isSelected && !isCorrectAnswer && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <X className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 答案解释 */}
              {isAnswered && (
                <div className={`mt-6 p-6 rounded-2xl ${
                  isCorrect 
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30' 
                    : 'bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/30'
                } animate-fly-in-bottom`}>
                  <div className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? "✨ 太棒了！" : "💫 再接再厉"}
                  </div>
                  <p className="text-gray-300">{question.explanation}</p>
                </div>
              )}

              {/* 错误提示 */}
              {submitError && (
                <div className="mt-6 p-6 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400">
                  <p className="font-semibold mb-1">上链失败</p>
                  <p className="text-sm">{submitError}</p>
                </div>
              )}

              {/* 下一题按钮 */}
              {isAnswered && (
                <button
                  onClick={handleNext}
                  disabled={submitting}
                  className="mt-6 w-full py-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl font-bold text-white text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentQuestion < totalQuestions - 1 ? (
                    <>
                      下一题
                      <ArrowRight className="w-6 h-6" />
                    </>
                  ) : submitting ? (
                    "上链中..."
                  ) : (
                    "完成并上链"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
