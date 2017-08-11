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
        0: "rgb(0,0,0)",
        0.1: "rgb(5,21,5)",
        0.2: "rgb(10,41,10)",
        0.3: "rgb(15,62,15)",
        0.4: "rgb(20,82,20)",
        0.5: "rgb(25,103,25)",
        0.6: "rgb(30,123,30)",
        0.7: "rgb(35,144,35)",
        0.8: "rgb(40,164,40)",
        0.9: "rgb(45,185,45)",
        1: "rgb(50,205,50)",
      };

      score = Math.round(score / 10) / 10;
      return { backgroundColor: colors[score] };
    }

    const congrat = score => {
      if (score > 50){
        return "Great!";
      }
      return "Do better!";
    };

    let ordinary = [];
    let special = [];
    Object.keys(comps).forEach(k => {
      const item = {
        name: k,
        score: comps[k].score,
      };

      if (comps[k].special){
        item.special = comps[k].special;
        special.push(item);
      }
      else{
        ordinary.push(item);
      }
    });

    ordinary.sort((a, b) => a.score - b.score).reverse();
    special.sort((a, b) => a.score - b.score).reverse();

    const renderRows = results => {
      let rows = [];
      results.forEach(r => {
        rows.push(
          <tr>
            <td>{r.name}</td>
            <td>{r.score}%</td>
            <td>({congrat(r.score)})</td>
            <td class="heatcell" style={heat(r.score)}></td>
          </tr>
        );
      });
      return rows;
    };

    const renderTable = (ordinary, special) => {
      return (
        <table>
          {renderRows(ordinary)}
          {special.length > 0 && 
            <tr>
              <td class="special" colspan={4}>
                Areas of specialisation you may want to consider:
              </td>
            </tr>
          }
          {special.length > 0 && 
            <tbody>
              {renderRows(special)}
            </tbody>
          }
        </table>
      );
    }

    let cells = [];
    for (let i=0; i<=100; i+=10){
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
        {renderTable(ordinary, special)}
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
