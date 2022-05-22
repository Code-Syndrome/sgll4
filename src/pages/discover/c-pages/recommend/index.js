import React, { memo } from 'react';

import HYRankingList from './c-cpns/ranking-list';
import {
  RecommendWraper,
  Content,
  RecommendLeft,
  RecommendRight
} from "./style";

export default memo(function HYRecommend() {
  return (
    <RecommendWraper>
      <Content className="wrap-v2">
        <RecommendLeft>
          <HYRankingList />
        </RecommendLeft>
        <RecommendRight>
        </RecommendRight>
      </Content>
    </RecommendWraper>
  )
})
