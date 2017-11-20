import { h, Component } from 'preact';
import { route } from 'preact-router';
import { authFetch } from '../../../lib/fetch';
import {
  Screen, 
  renderLoader,
} from '../Screen';

import { DiagQuestion } from "./DiagQuestion";

export { DiagScreen };


class DiagScreen extends Screen{
  constructor(props){
    super(props);
    this.state = {
      answers: {},
      toHighlight: [],
    };
  }


  componentWillMount = () => {
    if (this.props.techRole != null){
      const role = this.props.techRole;
      const url = "/techdiag?r=" + encodeURIComponent(role.id);
      authFetch(url).then(response => {
        response.json().then(diag => {
          this.setState({ diag , role });
        });
      });
    }
    else{
      const selectedOptions = this.props.selectedOptions;
      const currentRole = selectedOptions["role"];

      let nextRole = null;
      if (Object.keys(selectedOptions).indexOf("nextrole") > -1){
        nextRole = selectedOptions["nextrole"];
      }

      let role;
      if (nextRole){
        role = nextRole
      }
      else{
        role = currentRole;
      }

      const url = "/diag?r=" + encodeURIComponent(role.id);
      authFetch(url).then(response => {
        response.json().then(diag => {
          this.setState({ diag, role });
        });
      });
    }
  }


  handleOptionSelect = (qnId, answerNum) => {
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

    this.setState({ answers, toHighlight }, () => {
      this.props.handleOptionSelect(this.props.name, answers);
    });
  }


  renderQns = (qns, toHighlight) => {
    let result = [];

    qns.forEach(qn => {
      const highlight = toHighlight.indexOf(qn.id) > -1;
      result.push(
        <DiagQuestion 
          handleOptionSelect={this.handleOptionSelect}
          highlight={highlight}
          qn={qn} />
      );
    });
    return result;
  }


  handleSubmitBtnClick = () => {
    route(this.props.resultsPath);
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

    const btn = (
      <a onClick={() => {
        if (numAnswered === numQns){
          this.handleSubmitBtnClick();
        }
        else{
          this.highlightUnanswered();
        }
      }}
        class={"no_user_select diag_button " + disabled}>
        Find out my learning needs
      </a>
    );

    const roleName = this.state.role.name;

    return(
      <div class="pure-g">
        <div class="pure-u-1">
          {this.renderStartOver(this.props.techRole != null)}
          <div className="diag question">
            <h2>As a {roleName}...</h2>
            {this.renderQns(this.state.diag, this.state.toHighlight)}
            {warning}
            {btn}
          </div>
        </div>
      </div>
    );
  }
}
