import { h, Component } from 'preact';

export class Navbar extends Component {
          //<a href="/cms/courses/">Courses</a>
  render(){
    return(
      <div>
        <div class="section">
          <a href="/cms/">Home</a>
        </div>

        <div class="section">
          <a href="/cms/courses/published">Published courses</a>
        </div>

        <div class="section">
          <a href="/cms/courses/unpublished">Unpublished courses</a>
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
