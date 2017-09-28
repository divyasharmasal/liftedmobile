import { h, Component } from "preact";

export class CourseSorter extends Component{
  render(){
    return(
      <div class="course_sorter">
        <div class="sorter_content">
          <div class="pri sort">
            <div class="label">
              Sort by:
            </div>
            <div class="sec">
              date ▼
            </div>
            <div class="sec">
              cost ▼
            </div>
            <div class="sec">
              points ▼
            </div>
          </div>

          <div class="pri filter">
            <div class="label">
              Filter by:
            </div>
            <div class="sec">
              date ▼
            </div>
            <div class="sec">
              provider ▼
            </div>
          </div>
        </div>
      </div>
    );
  }
}

