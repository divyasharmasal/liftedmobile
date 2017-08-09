import { h, Component } from 'preact';
import Question from '../../Question';
import { authFetch } from '../../fetch';
import {
  Screen, 
} from '../Screen';

export {DiagResultsScreen};

class DiagResultsScreen extends Screen{
  componentWillMount = () => {
    let answers = this.props.answers;
    if (this.props.answers){
      sessionStorage.setItem("diagAnswers", JSON.stringify(answers));
    }
    else{
      answers = JSON.parse(sessionStorage.getItem("diagAnswers"));
    }

    let url = "/results?";
    Object.keys(answers).forEach(compId => {
      let answer = answers[compId];
        url += "&" + encodeURIComponent(compId) + "=" + 
                     encodeURIComponent(answer);
    });

    authFetch(url).then(response => {
      response.json().then(results => {
        this.setState({ results });
      });
    });

  }


  renderCompetencies = comps => {
    let results = [];
    const colors = {
      0: "rgb(169,169,169)",
      0.1: "rgb(156,166,156)",
      0.2: "rgb(142,163,142)",
      0.3: "rgb(129,160,129)",
      0.4: "rgb(115,157,115)",
      0.5: "rgb(102,154,102)",
      0.6: "rgb(88,151,88)",
      0.7: "rgb(75,148,75)",
      0.8: "rgb(61,145,61)",
      0.9: "rgb(48,142,48)",
      1: "rgb(34,139,34)",
    };

    let competencies = [];
    Object.keys(comps).forEach(key => {
      competencies.push({
        score: comps[key],
        text: key,
      });
    });

    competencies.sort((a, b) => a.score - b.score).reverse();
    let min = Math.min(...competencies.map(x => x.score));
    if (min > 0){
      min = 0;
    }

    competencies.forEach((c, i) => {
      competencies[i].score += Math.abs(min);
    });

    const scores = competencies.map(x => x.score);
    const total = scores.reduce((acc, cur) => acc + cur);
    const colorVals = scores.map(x => Math.round(x / total * 10) / 10);

    competencies.forEach((c, i) => {
      results.push(
        <p>
          <span style={{ 
            color: colors[colorVals[i]] 
          }}>
            {c.text}
          </span>
        </p>
      );
    });
    return <div>{results}</div>;
  }


  renderResults = results => {
    return (
      <div>
        <div class="competencies">
          <p>In order of strength:</p>
          {this.renderCompetencies(results)}
        </div>
      </div>
    );
  }


  render(){
    if (!this.state.results){
      return [];
    }
    return(
      <div className="pure-g">
        <div className="pure-u-1">
          <div className="question results">
            <h1>Your competencies</h1>
            {this.renderResults(this.state.results)}
          </div>
        </div>
      </div>
    );
  }
}
