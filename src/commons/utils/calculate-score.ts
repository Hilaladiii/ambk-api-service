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
      const uVal =
        userAnswer.key !== undefined ? userAnswer.key : userAnswer.value;
      const cVal =
        correctAnswer.key !== undefined ? correctAnswer.key : correctAnswer.value;
      return uVal === cVal ? maxPoint : 0;

    case 'MATCHING':
      const uPairs = userAnswer.pairs || userAnswer;
      const cPairs = correctAnswer.pairs || correctAnswer;
      return isEqual(uPairs, cPairs) ? maxPoint : 0;

    case 'ESSAY':
      return 0;

    default:
      return 0;
  }
}
