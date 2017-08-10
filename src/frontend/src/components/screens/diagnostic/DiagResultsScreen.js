import { h, Component } from 'preact';
import { route } from 'preact-router';
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

    if (!answers){
      route("/")
    }
    else{
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
  }


  renderCompetencies = comps => {
    const heat = score => {
      const colors = {
        1: "rgb(247,117,140)",
        0.9: "rgb(245,121,126)",
        0.8: "rgb(244,125,112)",
        0.7: "rgb(242,130,98)",
        0.6: "rgb(240,134,84)",
        0.5: "rgb(239,138,70)",
        0.4: "rgb(237,142,56)",
        0.3: "rgb(235,146,42)",
        0.2: "rgb(233,151,28)",
        0.1: "rgb(232,155,14)",
        0: "rgb(230,159,0)",
      };

      score = Math.round(score / 10) / 10;
      return { backgroundColor: colors[score] };
    }

    let c = [];
    Object.keys(comps).forEach(k => {
      c.push({
        name: k,
        score: comps[k]
      })
    });

    c.sort((a, b) => a.score - b.score).reverse();

    const rows = [];
    c.forEach(r => {
      rows.push(
        <tr>
          <td>{r.name}</td>
          <td>{r.score}%</td>
          <td class="heatcell" style={heat(r.score)}></td>
        </tr>
      );
    });

    let cells = [];
    for (let i=0; i<100; i+=10){
      cells.push(
        <td class="heatcell" style={heat(i)}></td>
      );
    }

    const legend = (
      <table>
        <tr>
          <td>Weak</td>
          {cells}
          <td>Strong</td>
        </tr>
      </table>
    );

    return (
      <div>
        <table>
          {rows}
        </table>
        <p>Legend</p>
        {legend}
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
            <div class="competencies">
              {this.renderCompetencies(this.state.results)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
