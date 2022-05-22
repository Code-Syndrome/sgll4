import React from 'react';
import { Redirect } from "react-router-dom";

const HYDiscover = React.lazy(_ => import("../pages/discover"));
const HYRecommend = React.lazy(_ => import("../pages/discover/c-pages/recommend"));
const HYFriend = React.lazy(_ => import("../pages/friend"));
const HYMine = React.lazy(_ => import("../pages/mine"));

export default [
  {
    path: "/",
    exact: true,
    render: () => (
      <Redirect to="/discover"/>
    )
  },
  {
    path: "/discover",
    component: HYDiscover,
    routes: [
      {
        path: "/discover",
        exact: true,
        render: () => (
          <Redirect to={"/discover/recommend"}/>
        )
      },
      {
        path: "/discover/recommend",
        component: HYRecommend
      }
    ]
  },
  {
    path: "/friend",
    component: HYFriend
  },
  {
    path: "/mine",
    component: HYMine
  }
]