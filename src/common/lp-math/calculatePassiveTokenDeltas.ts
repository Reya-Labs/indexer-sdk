import JSBI from 'jsbi';
import { FullMath } from './fullMath';
import { Q96, ONE, ZERO, NEGATIVE_ONE } from './internalConstants';
import { TickMath } from './tickMath';


type PassiveTokenDeltas = {
    variableTokenDelta: JSBI;
    fixedTokenDeltaUnbalanced: JSBI;
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
    
    let variableTokenDelta: JSBI = ZERO;
    let fixedTokenDeltaUnbalanced: JSBI = ZERO;

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
                variableTokenDelta: ZERO,
                fixedTokenDeltaUnbalanced: ZERO
            }

        }

        const liquidityJSBI: JSBI = JSBI.BigInt(liquidity);
        let sqrtRatioA96: JSBI;
        let sqrtRatioB96: JSBI;

        if ((tickCurrent >= tickLower) && (tickCurrent < tickUpper)) {

            // lowerBound = tickLower
            // upperBound = tickCurrent

            // todo: write tests to check for precision
            
            sqrtRatioA96 = TickMath.getSqrtRatioAtTick(tickLower); 
            sqrtRatioB96 = TickMath.getSqrtRatioAtTick(tickCurrent);
            
        } else {
            // i.e. > tickUpper


            // lower bound = tickLower
            // upper bound = tickUpper

            sqrtRatioA96 = TickMath.getSqrtRatioAtTick(tickLower); 
            sqrtRatioB96 = TickMath.getSqrtRatioAtTick(tickUpper);

        }

        /*  
            in both of the two scenarios above: 
            the latest swap has pushed the price up, hence pushed the fixed rate down
            since it pushed the fixed rate down, it must have been a fixed taker swap from trader's (taker's) perspective
            which in turn means it is a variable taker swap from lp's (maker's) perspective, hence the sign of
            variable token delta is positive and sign of fixed token delta is negative
        */ 

        // todo: check if round up needs to be true or false when running sims and tests
        variableTokenDelta = getAmount1Delta(
            sqrtRatioA96,
            sqrtRatioB96, 
            liquidityJSBI,
            true
        );
        
        // todo: check if round up needs to be true or false when running sims and tests
        fixedTokenDeltaUnbalanced = getAmount0Delta(
            sqrtRatioA96,
            sqrtRatioB96, 
            JSBI.multiply(NEGATIVE_ONE, liquidityJSBI),
            true
        );

    } else if (tickPrevious < tickUpper) { 

    } else {

    }

    return { 
        variableTokenDelta: variableTokenDelta,
        fixedTokenDeltaUnbalanced: fixedTokenDeltaUnbalanced
    }

}