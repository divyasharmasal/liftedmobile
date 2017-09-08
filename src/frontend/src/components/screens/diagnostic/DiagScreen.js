import { h, Component } from 'preact';
import { route } from 'preact-router';
import Question from '../../Question';
import { authFetch } from '../../fetch';
import {
  Screen, 
  renderStartOver,
  renderLoader,
} from '../Screen';

export {DiagScreen};


class DiagQuestion extends Component{
  constructor(props){
    super(props);
    this.state = {
      selectedAnswerId: null,
      shouldHighlight: false,
      highlight: this.props.highlight,
      showHelp: false,
    };
  }

  componentWillReceiveProps(nextProps){
    if (this.props.highlight !== nextProps.highlight){
      this.setState({ 
        highlight: nextProps.highlight 
      });
    }
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


  showHelp = () => {
    this.setState({
      showHelp: !this.state.showHelp,
    });
  }


  render(){
    let qn = this.props.qn;
    //const answers = ["Yes", "I'm not sure", "No"];
    const answers = [
      <img class="emoji" src="/static/app/dist/images/smiley.png" />, 
      <img class="emoji" src="/static/app/dist/images/frown.png" />
    ];
    let ansElms = [];
    answers.forEach((answer, i) => {
      let answerClass = "answer has_emoji";
      if (i === this.state.selectedAnswerId){
        answerClass += " selected";
      }
      ansElms.push(
        <div class={answerClass} onClick={() => {this.handleAnswerSelect(i)}}>
          {answer}
        </div>
      );
    });

    let highlightClass = "";
    if (this.state.highlight){
      highlightClass = "highlight";
    }

    let expln = [];
    qn.expln.split("\n").forEach(row => {
      expln.push(
        <li>{row}</li>
      );
    });

    let desc_prompt;
    if (this.state.showHelp){
      desc_prompt = "Hide description ▲";
    }
    else{
      desc_prompt = "Show description ▼";
    }

    return (
      <div class="diag_qn">
        <div class="diag_left">
          <p class={highlightClass}>{qn.desc}</p>
          <p class="diag_whatsthis"
            onClick={this.showHelp}>
            {desc_prompt}
          </p>
          {this.state.showHelp && 
            <div class="diag_help">
              <ul>
                {expln}
              </ul>
            </div>
          }
        </div>
        <div class="diag_right">
          <div class="diag_opts">
            {ansElms}
          </div>
        </div>
      </div>
    );
  }
}


class DiagScreen extends Screen{
  constructor(props){
    super(props);
    this.state = {
      answers: {},
      toHighlight: [],
    };
  }

  componentWillMount = () => {
    const selectedAnswers = this.props.selectedAnswers;
    let storedSelectedAnswers = sessionStorage.getItem("selectedAnswers");
    if ((!selectedAnswers && !storedSelectedAnswers) ||
         (Object.keys(selectedAnswers).length === 0 
           && !storedSelectedAnswers)){
      route("/");
    }
    else{
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
  }


  handleAnswerSelect = (qnId, answerNum) => {
    let answers = this.state.answers;
    let toHighlight = this.state.toHighlight;
    if (answerNum !== null){
      answers[qnId] = answerNum;
      const index = toHighlight.indexOf(qnId);
      if (index > -1){
        toHighlight.splice(index, 1);
      }
    }
    else{
      if (this.state.shouldHighlight){
        toHighlight.push(qnId);
      };
      delete answers[qnId];
    }
    this.setState({ answers, toHighlight });
  }


  renderQns = (qns, toHighlight) => {
    let result = [];

    qns.forEach(qn => {
      const highlight = toHighlight.indexOf(qn.id) > -1;
      result.push(
        <DiagQuestion 
          handleAnswerSelect={this.handleAnswerSelect}
          highlight={highlight}
          qn={qn} />
      );
    });
    return result;
  }


  handleSubmitBtnClick = () => {
    this.props.routeToDiagResults(this.state.answers);
  }


  highlightUnanswered = () => {
    const answeredQns = Object.keys(this.state.answers)
                              .map(x => parseInt(x, 10));
    const qns = this.state.diag;
    let unanswered = [];

    qns.map(x => x.id).forEach(qnId => {
      if (answeredQns.indexOf(qnId) === -1){
        unanswered.push(qnId);
      }
    });
    this.setState({ 
      toHighlight: unanswered,
      shouldHighlight: true,
    });
  }

  render(){
    if (!this.state.diag){
      return renderLoader();
    }

    const numAnswered = Object.keys(this.state.answers).length
    const numQns = Object.keys(this.state.diag).length

    let warning;
    let disabled;

    if (this.state.toHighlight.length > 0 && numAnswered < numQns){
      warning = (
        <p class="highlight warning">
          Please complete all questions to continue.
        </p>
      );

      disabled = "disabled";
    }

    let btn = (
      <a onClick={() => {
        if (numAnswered === numQns){
          this.handleSubmitBtnClick();
        }
        else{
          this.highlightUnanswered();
        }
      }}
        class={"diag_button " + disabled}>
        Find out my learning needs
      </a>
    );

    return(
      <div class="pure-g">
        <div class="pure-u-1">
          {renderStartOver()}
          <div className="diag question">
            <h1>I can...</h1>
            {this.renderQns(this.state.diag, this.state.toHighlight)}
            {warning}
            {btn}
          </div>
        </div>
      </div>
    );
  }
}
