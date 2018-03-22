const parseCourseDate = date => {
  if (date === "Q1"){
    return new Date("1 Jan");
  }
  else if (date === "Q2"){
    return new Date("1 Apr");
  }
  else if (date === "Q3"){
    return new Date("1 Jul");
  }
  else if (date === "Q4"){
    return new Date("1 Oct");
  }
  else{
    return new Date(date);
  }
};


const smallestDate = dates => {
  let smallest = null;

  dates.forEach(date => {
    const parsedDate = parseCourseDate(date);

    if (smallest == null){
      smallest = parsedDate;
    }
    else if (smallest > parsedDate){
      smallest = parsedDate;
    }
  });

  return smallest;
};


const sortCoursesByDate = courses => {
  courses.sort((a, b) => {
    const x = smallestDate(a.start_dates);
    const y = smallestDate(b.start_dates);

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


export { sortCoursesByDate };
