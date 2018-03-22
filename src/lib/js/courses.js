const sortCoursesByDateRange = courses => {
  courses.sort((a, b) => {
    const x = new Date(a.date_range.start);
    const y = new Date(b.date_range.start);

    if (x > y){
      return 1;
    }
    else if (x < y){
      return -1;
    }
    return 0;
  });

  return courses;
}


export { sortCoursesByDateRange };
