import { h, Component } from 'preact';

export class Navbar extends Component {
  render(){
    return(
      <div>
        <div class="section">
          <a href="/cms/">Home</a>
        </div>
        <div class="section">
          <a href="/cms/courses/">Courses</a>
        </div>
        <div class="section">
          <a href="/cms/scrapers/">Scrapers</a>
        </div>
        <div class="section">
          <a href="/cms/staff/">Staff</a>
        </div>
      </div>
    )
  }
}
