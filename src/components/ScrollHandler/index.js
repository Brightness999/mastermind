import { useEffect } from "react";
import PropTypes from "prop-types";
// import { withRouter } from "react-router-dom";
import {withRouter} from 'dva/router';
const ScrollHandler = ({ location }) => {
  useEffect(() => {
    const element = document.getElementById(location.hash);

    setTimeout(() => {
      window.scrollTo({
        behavior: element ? "smooth" : "auto",
        top: element ? element.offsetTop : 0
      });
    }, 100);
  }, [location]);

  return null;
};

ScrollHandler.propTypes = {
  location: PropTypes.shape({
    hash: PropTypes.string
  }).isRequired
};

export default withRouter(ScrollHandler);
