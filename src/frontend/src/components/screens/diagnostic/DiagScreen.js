import { h, Component } from 'preact';
import Question from '../../Question';
import { authFetch } from '../../fetch';
import {
  Screen, 
} from '../Screen';

export {DiagScreen};

class DiagScreen extends Screen{
  constructor(props){
    super(props);
    this.state = {
      answers: {},
    };
  }

  componentWillMount = () => {
    const selectedAnswers = this.props.selectedAnswers;
    const currentRole = selectedAnswers[5][0];
    let nextRole = null;
    if (Object.keys(selectedAnswers).indexOf("7") > -1){
      nextRole = selectedAnswers[7][0];
    }

    let role;
    if (nextRole){
      role = nextRole
    }
    else{
      role = currentRole;
    }

    const url = "/diag?r=" + encodeURIComponent(role);
    authFetch(url).then(response => {
      response.json().then(diag => {
        this.setState({ diag });
      });
    });
  }


  handleAnswerSelect = (qnId, answerNum) => {
    let answers = this.state.answers;
    answers[qnId] = answerNum;
    this.setState({ answers });
  }


  renderQns = qns => {
    let result = [];
    this.state.diag.forEach(qn => {
      result.push(
        <DiagQuestion 
          handleAnswerSelect={this.handleAnswerSelect}
          qn={qn} />
      );
    });
    return result;
  }


  handleSubmitBtnClick = () => {
    this.props.routeToDiagResults(this.state.answers);
  }


  render(){
    if (!this.state.diag){
      return [];
    }

    // Only show the button if at least one answer has been selected
    let btn;
    if (Object.keys(this.state.answers).length > 0){
      btn = <a onClick={this.handleSubmitBtnClick}
               class="diag_button">Find out my learning needs</a>;
    }

    return(
      <div class="pure-g">
        <div class="pure-u-1">
          <div className="diag question">
            <h1>Are you confident doing these tasks?</h1>
            {this.renderQns(this.state.diag)}
            {btn}
          </div>
        </div>
      </div>
    );
  }
}


class DiagQuestion extends Component{
  constructor(props){
    super(props);
    this.state = {
      selectedAnswerId: null,
    };
  }

  handleAnswerSelect = answerNum => {
    if (this.state.selectedAnswerId === answerNum){
      answerNum = null;
    }
    this.setState({
      selectedAnswerId: answerNum,
    }, () => {
      this.props.handleAnswerSelect(this.props.qn.id, answerNum);
    });
  }


  render(){
    let qn = this.props.qn;
    const answers = ["Yes", "I'm not sure", "No"];
    let ansElms = [];
    answers.forEach((answer, i) => {
      let answerClass = "answer";
      if (i === this.state.selectedAnswerId){
        answerClass += " selected";
      }
      ansElms.push(
        <div onClick={() => {this.handleAnswerSelect(i)}} 
          data-answer-id={i}
          class={answerClass}>{answer}</div>
      );
    });

    return (
      <div class="diag_qn">
        <p>{qn.desc}</p>
        {ansElms}
      </div>
    );
  }
}
