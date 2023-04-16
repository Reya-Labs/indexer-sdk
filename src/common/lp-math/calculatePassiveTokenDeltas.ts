import JSBI from 'jsbi';
import { FullMath } from './fullMath';
import { Q96, ONE } from './internalConstants';


type PassiveTokenDeltas = {
    variableTokenDelta: number;
    fixedTokenDeltaUnbalanced: number;
};

const getAmount0Delta = (sqrtRatioAX96: JSBI, sqrtRatioBX96: JSBI, liquidity: JSBI, roundUp: boolean): JSBI  => {
    if (JSBI.greaterThan(sqrtRatioAX96, sqrtRatioBX96)) {
      ;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
    }

    const numerator1 = JSBI.leftShift(liquidity, JSBI.BigInt(96))
    const numerator2 = JSBI.subtract(sqrtRatioBX96, sqrtRatioAX96)

    return roundUp
      ? FullMath.mulDivRoundingUp(FullMath.mulDivRoundingUp(numerator1, numerator2, sqrtRatioBX96), ONE, sqrtRatioAX96)
      : JSBI.divide(JSBI.divide(JSBI.multiply(numerator1, numerator2), sqrtRatioBX96), sqrtRatioAX96)
  }

const  getAmount1Delta = (sqrtRatioAX96: JSBI, sqrtRatioBX96: JSBI, liquidity: JSBI, roundUp: boolean): JSBI => {
    if (JSBI.greaterThan(sqrtRatioAX96, sqrtRatioBX96)) {
      ;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
    }

    return roundUp
      ? FullMath.mulDivRoundingUp(liquidity, JSBI.subtract(sqrtRatioBX96, sqrtRatioAX96), Q96)
      : JSBI.divide(JSBI.multiply(liquidity, JSBI.subtract(sqrtRatioBX96, sqrtRatioAX96)), Q96)
}



export const calculatePassiveTokenDeltas = (
    liquidity: number,
    tickUpper: number,
    tickLower: number,
    tickCurrent: number,
    tickPrevious: number
): PassiveTokenDeltas => {

    // assume that this lp is affected, i.e. the check of wether it is affected or not is done before
    // passing to this function

    if (tickPrevious < tickLower) {

        /*
            if we assume that the lp was affected by this trade, it must be that the 
            current tick is one of the two: 
                (>= tickLower) && (< tickUpper)
                > tickUpper
        */

        if (tickCurrent < tickLower) {

            return { 
                variableTokenDelta: 0,
                fixedTokenDeltaUnbalanced: 0
            }

        }

        if ((tickCurrent >= tickLower) && (tickCurrent < tickUpper)) {

            // lowerBound = tickLower
            // upperBound = tickCurrent

            // todo: write tests to check for precision
            const liquidityJSBI = JSBI.BigInt(liquidity);
            
 
            const variableTokenDelta: JSBI = getAmount1Delta(
                sqrtRatioA96,
                sqrtRatioB96, 
                liquidityJSBI
            );

            const fixedTokenDeltaUnbalanced: JSBI = getAmount0Delta(
                sqrtRatioA96,
                sqrtRatioB96, 
                liquidityJSBI
            );

        }
        

    } else if (tickPrevious < tickUpper) { 

    } else {

    }

    return { 
        variableTokenDelta: 0,
        fixedTokenDeltaUnbalanced: 0
    }

}