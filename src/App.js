import React,{Component} from 'react';
import './App.css';
import Continer from './component/continer'
import { connect } from 'react-redux'
import ActualRan from './service/ActualRun'
import traffictracing from './service/tracking'
class App extends Component  {
  componentDidMount() {
    if(this.props.selectuser!=null)
    {

    }
  }
  render(){
  return (
    <div className="App">
      <Continer></Continer>
    </div>
  );
  }
}
const mapStateToProps = state => {
  return {
      selectuser: state.user.user
  }
}
export default connect(mapStateToProps)(App);

