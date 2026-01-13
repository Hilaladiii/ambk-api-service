import { isEqual } from 'lodash';

export function calculateScore(
  type: string,
  userAnswer: any,
  correctAnswer: any,
  maxPoint: number,
): number {
  if (!userAnswer) return 0;

  switch (type) {
    case 'MULTIPLE':
    case 'TRUE_FALSE':
      const uVal = userAnswer.key || userAnswer;
      const cVal = correctAnswer.key || correctAnswer;
      return uVal === cVal ? maxPoint : 0;

    case 'MATCHING':
      return isEqual(userAnswer, correctAnswer) ? maxPoint : 0;

    case 'ESSAY':
      return 0;

    default:
      return 0;
  }
}
