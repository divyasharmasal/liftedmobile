import { h, Component } from 'preact';
import { route } from 'preact-router';
import Question from '../../Question';
import { authFetch } from '../../../lib/fetch';
import { Courses } from '../../Courses';
import {
  renderLoader,
  Screen, 
} from '../Screen';

export { DiagResultsScreen };

const stars = score => {
  const empty = <span class="empty star no_user_select">☆</span>;
  const full = <span class="star no_user_select">★</span>;
  const max = 5;
  const numFull = Math.round(score / 20);
  const numEmpty = max - numFull;

  let stars = [];
  for (let i=0; i<numFull; i++){
    stars.push(full);
  }
  for (let i=0; i<numEmpty; i++){
    stars.push(empty);
  }

  return <span class="stars">{stars}</span>;
}


class CategoryCourses extends Component{
  constructor(props){
    super(props);
    this.state = {
      show: this.props.showByDefault,
    };
  }


  componentWillReceiveProps = nextProps => {
    if (this.props.anchorSelected === false && 
        nextProps.anchorSelected === true){
      this.setState({
        show: true,
      });
    }
  }


  render(){
    const toggleArrow = this.state.show ? "▲" : "▼";
    const showHide = this.state.show ? "" : "hide";

    return(
      <div class="result_category">
        <a name={encodeURIComponent(this.props.categoryName)}></a>

        <div class="course_category">
          <p class="category_name"
            onClick={() => {
              this.setState({
                show: !this.state.show,
              });
            }}>
            {this.props.categoryName + " " + toggleArrow}
          </p>
          <p class="results">
            {stars(this.props.results[this.props.categoryName].score)}
          </p>
        </div>

        <div class={"course_table " + showHide}>
          {this.props.results[this.props.categoryName].score === 100 &&
            <p class="great">
              Great, you're all covered. Here are some programmes to
            take you to the next level:</p>
          }
          {/*<p>Here are some courses to consider based on what's available.</p>*/}
          <p class="back_to_top"><a href="#top">back to top</a></p>

          <Courses courses={this.props.courseList} />

        </div>
      </div>
    );
  }
}


class DiagResultsScreen extends Screen{
  constructor(props){
    super(props);
    this.state = {
      selectedCategory: null,
    };
  }


  componentWillMount = () => {
    const answers = this.props.techRole != null ? 
      this.props.selectedOptions["tech_diag"] :
      this.props.selectedOptions["diag"];

    let url;

    if (this.props.techRole != null){
      url = "/techdiagresults?r=" + encodeURIComponent(this.props.techRole);

      Object.keys(answers).forEach(compId => {
        let answer = answers[compId];
        url += "&" + encodeURIComponent(compId) + "=" + 
          encodeURIComponent(answer);
      });

      console.log(url);
    }
    else{
      //const answers = this.props.selectedOptions["diag"];

      if (!answers){
        route("/");
      }
      else{
        url = "/results?";

        // Get role ID from prev answers
        let roleId = this.props.selectedOptions["role"];
        if (Object.keys(this.props.selectedOptions).indexOf("nextrole") > -1){
          roleId = this.props.selectedOptions["nextrole"];
        }

        if (!roleId){
          route("/");
        }

        const verticalId = this.props.selectedOptions["vertical"];
        url += "v=" + encodeURIComponent(verticalId);
        url += "&r=" + encodeURIComponent(roleId);

        Object.keys(answers).forEach(compId => {
          let answer = answers[compId];
          url += "&" + encodeURIComponent(compId) + "=" + 
            encodeURIComponent(answer);
        });
      }
    }

    // Fetch recommended courses
    authFetch(url).then(response => {
      response.json().then(results => {
        this.setState({ 
          results: results.competencies,
          courses: results.courses,
        });
      });
    });
  }



  renderCompetencies = (results, courses) => {
    let ordinary = [];
    let special = [];
    Object.keys(results).forEach(k => {
      const item = {
        name: k,
        score: results[k].score,
      };

      if (results[k].special){
        item.special = results[k].special;
        special.push(item);
      }
      else{
        ordinary.push(item);
      }
    });

    ordinary.sort((a, b) => a.score - b.score);
    special.sort((a, b) => a.score - b.score).reverse();

    const renderRows = (results, map) => {
      let rows = [];
      results.forEach(r => {
        let name;
        if (map[r.name].length > 0){
          name = (
            <a class="competency_anchor" 
              onClick={() => {
                this.setState({
                  selectedCategory: r.name,
                });
              }}
              href={"#" + encodeURIComponent(r.name)}>
              {r.name}
            </a>
          );
        }
        else{
          name = r.name;
        }
        rows.push(
          <tr>
            <td>
              {name}
            </td>
            <td>{stars(r.score)}</td>
          </tr>
        );
      });
      return rows;
    };

    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Rating</th>
            </tr>
          </thead>
          {renderRows(ordinary, courses.map)}
          {special.length > 0 && 
            <tr>
              <td class="special" colspan={4}>
                Areas of specialisation you may want to consider:
              </td>
            </tr>
          }
          {special.length > 0 && 
            <tbody>
              {renderRows(special, courses.map)}
            </tbody>
          }
        </table>
      </div>
    );
  }


  renderCourses = (results, courseMapAndList) => {

    const renderTables = (categoryNames, courses, courseMap, isGood) => {
      let recs = [];
      let notFound = [];

      // sort categoryNames
      categoryNames.sort((a, b) => 
        results[a].score - results[b].score
      );

      // Show the first category with items
      let shown = false;

      categoryNames.forEach((cat, i) => {
        const courseList = courseMap[cat].map(courseHid => 
          courses[courseHid]
        );

        let show = false;

        if (shown === false && courseList.length > 0){
          shown = true;
          show = true;
        }

        if (courseList.length > 0){
          recs.push(
            <CategoryCourses
              showByDefault={show}
              courseList={courseList}
              results={results}
              anchorSelected={cat === this.state.selectedCategory}
              categoryName={cat} />
          );
        }
        else{
          notFound.push(cat);
        }
      });

      const sentence = arr => {
        return arr.slice(0, -2).join(", ") + (arr.slice(0, -2).length ? ", " : "") + 
          arr.slice(-2).join(" and ");
      }

      if (notFound.length > 0){
        recs.push(
          <div class="not_found">
            <p>No courses found for {sentence(notFound)}.</p>
          </div>
        );
      }

      return recs;
    }


    const sortCategories = results => {
      let normal = [];
      let special = [];

      Object.keys(results).sort().forEach(cat => {
        if (results[cat].special){
          special.push(cat);
        }
        else{
          normal.push(cat);
        }
      });
      return normal.concat(special);
    }

    const courses = courseMapAndList.courses;
    const courseMap = courseMapAndList.map;
    const categories = sortCategories(results);

    return (
      <div class="result_courses">
        <h1>Courses tailored for you</h1>
        {renderTables(categories, courses, courseMap)}
      </div>
    );
  };


  render(){
    if (!this.state.results){
      return renderLoader();
    }
    return(
      <div className="pure-g">
        <a name="top"></a>
        <div className="pure-u-1">
          {this.renderStartOver()}
          <div className="question results">
            <h1>Your competencies</h1>
            <p>Click on each name below to jump to courses that help you to improve.</p>
            <div class="competencies">
              {this.renderCompetencies(this.state.results, this.state.courses)}
            </div>
            <div class="diag_courses">
              {this.renderCourses(this.state.results, this.state.courses)}
              <div style={{height:"90vh"}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
