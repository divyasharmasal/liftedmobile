import { h, Component } from 'preact';
import { route } from 'preact-router';
import ScrollableAnchor from 'react-scrollable-anchor';
import { configureAnchors, goToAnchor } from 'react-scrollable-anchor';

import { authFetch } from '../../../lib/fetch';
import {
  Screen, 
  renderLoader,
} from '../Screen';

import { DiagQuestion } from "./DiagQuestion";

export { DiagScreen };

configureAnchors({
  offset:-20,
  scrollDuration: 0,
  keepLastAnchorHash: true,
})

class DiagScreen extends Screen{
  constructor(props){
    super(props);
    this.state = {
      answers: {},
      submitBtnClickedOnce: false,
    };
    this.shortcut = "";
  }


  componentWillMount = () => {
    document.addEventListener("keydown", event => {
      this.shortcut += event.key;
      if (this.shortcut === "123"){
        this.shortcut = "";
        const qnIds = this.state.diag.map(d => d.id);
        //let randAnswers = {};
        this.state.diag.forEach((d, i) => {
          //randAnswers[d.id] = i % 2 ? 0 : 1;
          this.handleOptionSelect(d.id, i % 2 ? 0 : 1)
        });
      }
    });

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
    let diag = this.state.diag;

    if (this.state.incomplete){
      let qn = diag.filter(qn => qn.id == qnId)[0];
      diag.splice(diag.indexOf(qn), 1);
      diag.push(qn);
    }

    // update this.state.answers and run this.props.handleOptionSelect
    let answers = this.state.answers;

    if (answerNum != null){
      answers[qnId] = answerNum;
    }
    else{
      delete answers[qnId];
    }

    const numAnswered = Object.keys(answers).length
    const numQns = Object.keys(this.state.diag).length
    const incomplete = numAnswered < numQns && this.state.submitBtnClickedOnce;

    this.setState({ diag, answers, incomplete }, () => {
      this.props.handleOptionSelect(this.props.name, answers);
    });
  }


  renderQns = (qns) => {
    if (this.state.incomplete){
      const warning = (
        <ScrollableAnchor id="w">
          <div class="warning pure-u-1">
            <p 
              ref={warning => this.warning = warning}
              class="highlight warning">
              Please complete all questions to continue.
            </p>
          </div>
        </ScrollableAnchor>
      );

      let completeQns = [];
      let incompleteQns = [];
      this.state.diag.forEach(qn => {
        if (Object.keys(this.state.answers).indexOf(qn.id.toString()) > -1){
          completeQns.push(this.renderQn(qn));
        }
        else{
          incompleteQns.push(this.renderQn(qn));
        }
      });

      if (!this.state.submitBtnClickedOnce){
        return completeQns.concat(incompleteQns);
      }
      else{
        return completeQns.concat([warning]).concat(incompleteQns);
      }
    }
    else{
      return qns.map(this.renderQn);
    }

  }


  renderQn = qn => {
    return (
      <DiagQuestion 
        handleOptionSelect={this.handleOptionSelect}
        selectedAnswerId={this.state.answers[qn.id]}
        qn={qn} />
    );
  }


  renderSubmitBtn = (answers, qns) => {
    if (!this.state.submitBtnClickedOnce){
      return (
        <div class="diag_button_row pure-u-1">
          <a onClick={this.handleSubmitBtnClick}
            class="no_user_select diag_button">
            Show me my learning needs
          </a>
        </div>
      );
    }

    const numAnswered = Object.keys(answers).length
    const numQns = Object.keys(qns).length
    const incomplete = numAnswered < numQns;
    const disabled = incomplete ? " disabled" : "";

    return (
      <div class="diag_button_row pure-u-1">
        <a onClick={this.handleSubmitBtnClick}
          class={"no_user_select diag_button" + disabled}>
          Show me my learning needs
        </a>
      </div>
    );
  }


  handleSubmitBtnClick = () => {
    const numAnswered = Object.keys(this.state.answers).length
    const numQns = Object.keys(this.state.diag).length
    const incomplete = numAnswered < numQns;

    this.setState({ submitBtnClickedOnce: true }, () => {
      if (incomplete){
        this.setState({
          incomplete: true,
        }, () => {
          goToAnchor("w");
        });
      }
      else{
        // Move on to the next page
        route(this.props.resultsPath);
      }
    });
  }
 

  render(){
    if (!this.state.diag){
      return renderLoader();
    }
    return (
      <div class="pure-g">
        <div className="pure-u-1-3">
          <a class="no_user_select top_nav_link home" 
             onClick={() => { route("/") }}>
            <img src="/static/app/dist/images/home.png" />
            Home
          </a>
        </div>
        <div className="pure-u-1-3 start_over_parent">
          {this.renderStartOver(this.props.techRole != null)}
        </div>
        <div class="pure-u-1">
          <div className="diag question">
            <h2>As a {this.state.role.name} <wbr />...</h2>
            {this.renderQns(this.state.diag)}
            {this.renderSubmitBtn(this.state.answers, this.state.diag)}
          </div>
        </div>
      </div>
    );
  }
}
