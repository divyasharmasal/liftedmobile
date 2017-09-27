import { h, Component } from "preact";

export class CourseListEntry extends Component{
  constructor(props){
    super(props);
    this.state = {
      showDetails: false,
    };
  }


  toggleExpand = () => {
    this.setState({
      showDetails: !this.state.showDetails,
    });
  }


  render() {
    let toggleClass, detailsVisibilityClass;
    if (this.state.showDetails){
      toggleClass = "show";
      detailsVisibilityClass = "show";
    }
    else{
      toggleClass = "hide";
      detailsVisibilityClass = "hide";
    }
    return(
      <div class="course">
        <div class="nums pure-u-5-24">
          <div class="cpd">
            <span class="num">13 CPD points</span>
          </div>

          <div class="cost">
            <span class="num">$ 850</span>
          </div>

        </div>

        <div class="pure-u-18-24">
          <div class="title">
            SIAC Academy 2017 - Time and Cost Savers at SIAC: Emergency
            Arbitration, Expedited Procedure and Early Dismissal
          </div>

          <div class={"pure-u-1 details " + detailsVisibilityClass}>
            hi
          </div>

        </div>

        <div 
          onClick={this.toggleExpand}
          class={"toggle pure-u-1-24 " + toggleClass}>
          <img src="/static/app/dist/images/courses/expand.png" />
        </div>

      </div>
    );
  }
}

