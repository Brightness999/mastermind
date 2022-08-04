import $$, { request } from 'cmn-utils';
import objectAssign from 'object-assign';
import PageInfo from './pageHelper/PageInfo';
import config from '../config';

const REQUEST = '@request';
const REQUEST_SUCCESS = '@request_success';
const REQUEST_ERROR = '@request_error';
/**
 * If you simply want to change a state, you can use this action in the page.
 * dispatch({
 *   type: 'crud/@change',
 *   payload: {
 *     showModal: true,
 *   },
 *   success: () => {
 *     console.log('state updated!')
 *   }
 * })
 */
const CHANGE_STATE = '@change';
const CHANGE_STATE_SUCCESS = '@change_success';

/**
 * Encapsulate asynchronous methods in the service, such as using in the model
   const url = '/getPageList';
   const pageInfo = yield call(asyncRequest, {...payload, url});
   yield put({
     type: 'getPageListSuccess',
     payload: pageInfo
   });
 * @param {*} payload
 */
export async function asyncRequest(payload) {
  if (!payload || !payload.url)
    throw new Error('payload require contains url opt');
  /**
   * Other methods can be configured such as method headers data
   */
  const { url, pageInfo, ...other } = payload;

  // If it is a paged query (formatted send parameters)
  if (pageInfo && pageInfo instanceof PageInfo) {
    const { pageNum, pageSize, filters, sorts } = pageInfo;
    let data = { pageNum, pageSize, filters, sorts };

    if ($$.isFunction(config.pageHelper.requestFormat)) {
      data = config.pageHelper.requestFormat(pageInfo);
    }
    other.data = data;
  }

  const _promise = other.method
    ? request[other.method.toLowerCase()](url, other.data, other)
    : request.send(url, other);

  // If it is a paged query (formatted back result)
  if (pageInfo && pageInfo instanceof PageInfo) {
    return _promise.then(resp => {
      if ($$.isFunction(config.pageHelper.responseFormat)) {
        const newPageInfo = config.pageHelper.responseFormat(resp);
        // Generate new instances to prevent old and new from pointing to the same instance
        return objectAssign(new PageInfo(), pageInfo, newPageInfo);
      }
      return null;
    });
  }
  return _promise;

}

export const simpleModel = {
  namespace: $$.randomStr(4),
  enhance: true,
  state: {},
  effects: {},
  reducers: {}
};

export default model => {
  const { namespace, state, subscriptions, effects, reducers, enhance } = {
    ...simpleModel,
    ...model
  };

  if (!enhance) {
    return { namespace, state, subscriptions, effects, reducers };
  }
  return {
    namespace,
    state,
    subscriptions,
    effects: {
      // get old effect
      ...effects,
      /**
       * payload If you pass in the payload of the array, the result will be merged and the rendering will be called once.
       * success Get a successful callback after the dispatch ends
       * error Get a failed callback after the dispatch ends
       * afterResponse Simulating operations in reduce allows us to have the opportunity to process the data back, without side effects
       */
      *[REQUEST]({ payload, success, error, afterResponse }, { call, put }) {
        let _payloads = [];
        if ($$.isObject(payload)) {
          _payloads.push(payload);
        } else if ($$.isArray(payload)) {
          _payloads = payload;
        }

        const resultState = {
          success: {},
          error: {}
        };

        for (let i = 0; i < _payloads.length; i += 1) {
          /**
           * valueField: The returned result will be received using the value of the valueField field.
           * notice: Popup notification
           * actionType: If there is an actionType, it means that the reducer has been processed by itself, and the value is actionType + ('_SUCCESS' | '_ERROR')
           */
          const { valueField, notice, actionType, ...otherPayload } = _payloads[i];

          try {
            let response = yield call(asyncRequest, otherPayload);

            // Self-processed data back, simulate the operation in reduce, do not write functions with side effects here
            if ($$.isFunction(afterResponse)) {
              const _r = afterResponse(response);
              if (_r) response = _r;
            }

            // If you need a callback
            if (otherPayload.success) {
              otherPayload.success(response);
            }

            // If notification is required
            if (notice) {
              config.notice.success(notice === true ? 'Successful operation' : notice[0]);
            }

            // If there is an actionType, it means that the self has been processed by the reducer.
            if (actionType) {
              yield put({
                type: `${actionType}_SUCCESS`,
                payload: response
              });
            } else {
              // Prepare return value
              resultState.success[valueField || '_@fake_'] = response;
            }
          } catch (e) {
            resultState.error.error = e;

            // If an internal callback is needed
            if ($$.isFunction(otherPayload.error)) {
              otherPayload.error(e);
            } else if ($$.isFunction(error)) {
              error(e);
            }

            // Notification reducer If there is an actionType, it means that the reducer has been processed.
            yield put({
              type: actionType ? `${actionType}_ERROR` : REQUEST_ERROR,
              payload: resultState.error
            });
            // Early termination if an error occurs
            break;
          }
        }

        // Notification reducer
        if (Object.keys(resultState.success).length) {
          // If you need a callback
          if ($$.isFunction(success)) {
            success(resultState.success);
          }

          yield put({
            type: REQUEST_SUCCESS,
            payload: resultState.success
          });
        }
      },

      *[CHANGE_STATE]({ payload, success }, { put }) {
        yield put({
          type: CHANGE_STATE_SUCCESS,
          payload
        });

        if ($$.isFunction(success)) {
          success();
        }
      }
    },

    reducers: {
      // get old reducers
      ...reducers,
      // append new request reducers
      [REQUEST_SUCCESS]: _changeState,
      [REQUEST_ERROR]: _changeState,
      [CHANGE_STATE_SUCCESS]: _changeState
    }
  };
};

const _changeState = (state, { payload }) => ({
  ...state,
  ...payload
});
