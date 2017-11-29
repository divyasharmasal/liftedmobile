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
      <a onClick={this.handleSubmitBtnClick}
        class={"no_user_select diag_button" + disabled}>
        Show me my learning needs
      </a>
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
        <div class="pure-u-1">
          {this.renderStartOver(this.props.techRole != null)}
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


//class DiagScreen extends Screen{
  //constructor(props){
    //super(props);
    //this.state = {
      //answers: {},
      //toHighlight: [],
    //};
  //}

  //handleOptionSelect = (qnId, answerNum) => {
    //let answers = this.state.answers;
    //let toHighlight = this.state.toHighlight;
    //if (answerNum !== null){
      //answers[qnId] = answerNum;
      //const index = toHighlight.indexOf(qnId);
      //if (index > -1){
        //toHighlight.splice(index, 1);
      //}
    //}
    //else{
      //if (this.state.shouldHighlight){
        //toHighlight.push(qnId);
      //};
      //delete answers[qnId];
    //}

    //this.setState({ answers, toHighlight }, () => {
      //this.props.handleOptionSelect(this.props.name, answers);
    //});
  //}


  //renderQns = (qns, toHighlight, showWarning) => {
    //const wrap = qn => 
      //<DiagQuestion 
        //handleOptionSelect={this.handleOptionSelect}
        //selectedAnswerId={this.state.answers[qn.id]}
        //highlight={toHighlight.indexOf(qn.id) > -1}
        //qn={qn} />

    //if (showWarning){
      //const warning = (
        //<p class="highlight warning">
          //Please complete all questions to continue.
        //</p>
      //);

      //let complete = [];
      //let incomplete = [];
      //qns.forEach(qn => {
        //if (toHighlight.indexOf(qn.id) > -1){
          //incomplete.push(wrap(qn));
        //}
        //else{
          //complete.push(wrap(qn));
        //}
      //});

      //const result = complete.concat([warning]).concat(incomplete);
      //return result;
    //}
    //else{
      //let result = [];

      //qns.forEach(qn => {
        //const highlight = toHighlight.indexOf(qn.id) > -1;
        //result.push(wrap(qn));
      //});
      //return result;
    //}
  //}


  //handleSubmitBtnClick = () => {
    //route(this.props.resultsPath);
  //}


  //highlightUnanswered = () => {
    //const answeredQns = Object.keys(this.state.answers).map(
        //x => parseInt(x, 10));

    //const unanswered = this.state.diag.filter(qn => 
      //answeredQns.indexOf(qn.id) === -1
    //).map(x => x.id);

    //this.setState({ 
      //toHighlight: unanswered,
      //shouldHighlight: true,
    //});
  //}


  //render(){
    //if (!this.state.diag){
      //return renderLoader();
    //}

    //const numAnswered = Object.keys(this.state.answers).length
    //const numQns = Object.keys(this.state.diag).length

    //let warning;
    //let disabled = "";

    //const showWarning = this.state.toHighlight.length > 0 
        //&& numAnswered < numQns;

    //if (showWarning){
      //disabled = " disabled";
    //}

    //const btn = (
      //<a onClick={() => {
        //if (numAnswered === numQns){
          //this.handleSubmitBtnClick();
        //}
        //else{
          //this.highlightUnanswered();
        //}
      //}}
        //class={"no_user_select diag_button" + disabled}>
        //Show me my learning needs
      //</a>
    //);

    //const roleName = this.state.role.name;

    //return(
      //<div class="pure-g">
        //<div class="pure-u-1">
          //{this.renderStartOver(this.props.techRole != null)}
          //<div className="diag question">
            //<h2>As a {roleName} <wbr />...</h2>
            //{this.renderQns(this.state.diag, this.state.toHighlight, showWarning)}
            //{btn}
          //</div>
        //</div>
      //</div>
    //);
  //}
//}
