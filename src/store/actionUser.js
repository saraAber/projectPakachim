import axios from 'axios'
import * as actionType from './action'
export const login = (tz) => {
  return dispatch => {
    axios.get("http://localhost:52726/api/driver?tz=" + tz).then(
      x => {
        if (x.data == null) {
          console.log(x.data);
        }
        else {
          console.log(x.data);
          dispatch({ type: actionType.selectUser, value: x.data })
          localStorage.setItem("id", tz);
          console.log("selectuser");
        }
      }
    ).catch(y => {
      dispatch({ type: actionType.error, value: true });
      console.log("error");
    })
  }
}
export const error = () => {
  return dispatch => {
    dispatch({ type: actionType.error, value: false });
  }
}
export const status = (status) => {
  return dispatch => {
    dispatch({ type: actionType.status, value: status });
  }
}
export const isValidIsraeliID=(id)=> {
  var id = String(id).trim();
  if (id.length > 9 || id.length < 9 || isNaN(id)) return false;
  id = id.length < 9 ? ("00000000" + id).slice(-9) : id;
  return Array
      .from(id, Number)
      .reduce((counter, digit, i) => {
          const step = digit * ((i % 2) + 1);
          return counter + (step > 9 ? step - 9 : step);
      }) % 10 === 0;
}
