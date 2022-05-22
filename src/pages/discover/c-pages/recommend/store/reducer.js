import { Map } from "immutable";
import * as actionTypes from './constants';

const defaultState = Map({
  topUpList: {},
  topNewList: {},
  topOriginList: {},
})

export default (state = defaultState, action) => {
  switch(action.type) {
    case actionTypes.CHANGE_UP_LIST:
      return state.set("topUpList", action.topUpList);
    case actionTypes.CHANGE_NEW_LIST:
      return state.set("topNewList", action.topNewList);
    case actionTypes.CHANGE_ORIGIN_LIST:
      return state.set("topOriginList", action.topOriginList);
    default:
      return state;
  }
}

