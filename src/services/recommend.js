import request from "./axios";

export function getTopList(idx) {
  return request({
    url: "/top/list",
    params: {
      idx
    }
  })
}
