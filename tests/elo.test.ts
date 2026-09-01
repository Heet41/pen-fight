import { RankedService } from '../backend/src/services/ranked.service';
import { getRankFromRating } from '../shared/src';

console.log('🏆 Running Elo & Ranking Test Suite...');

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${msg}`);
  }
}

// 1. Equal ratings match
const match1 = RankedService.calculateElo(1500, 1500, true);
assert(match1.changeA === 16, 'Winner of equal match gains +16 MMR');
assert(match1.changeB === -16, 'Loser of equal match loses -16 MMR');

// 2. Underdog victory
const match2 = RankedService.calculateElo(1200, 1800, true);
assert(match2.changeA > 25, 'Underdog win grants higher MMR gain (>25 MMR)');
assert(match2.changeB < -25, 'Favorite loss deducts higher MMR (>25 MMR)');

// 3. Rank threshold conversion
assert(getRankFromRating(1050) === 'BRONZE', '1050 rating is BRONZE');
assert(getRankFromRating(1350) === 'SILVER', '1350 rating is SILVER');
assert(getRankFromRating(1500) === 'GOLD', '1500 rating is GOLD');
assert(getRankFromRating(1700) === 'PLATINUM', '1700 rating is PLATINUM');
assert(getRankFromRating(1900) === 'DIAMOND', '1900 rating is DIAMOND');
assert(getRankFromRating(2050) === 'MASTER', '2050 rating is MASTER');
assert(getRankFromRating(2300) === 'GRANDMASTER', '2300 rating is GRANDMASTER');

console.log('✅ All Elo & Ranking Tests Passed!\n');
