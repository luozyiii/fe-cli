import { request } from '../utils';

export default function () {
  return request({
    url: '/project/template',
  });
}
