// http://www.wheresrhys.co.uk/fetch-mock/api
import packMock from '../utils/packMock';
import user from './user';
import crud from './crud';
import tree from './tree';
import formData from './form';
/**
 * Load mock file
 * packMock(mock1[,mock2])
 */
packMock(
  user,
  crud,
  tree,
  formData,
);
