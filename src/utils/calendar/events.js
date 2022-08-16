export default [
    {
      id: 0,
      title: "All Day Event very long title",
      allDay: true,
      start: new Date(2022, 9, 0),
      end: new Date(2022, 9, 1),
      color: '#e7973e',
    },
    {
      id: 1,
      title: "Long Event",
      start: new Date(2022, 9, 7, 7, 30, 0, 0),
      end: new Date(2022, 9, 7, 8, 30, 0, 0),
      color: '#7737ea'
    },
  
    {
      id: 2,
      title: "DTS STARTS",
      start: new Date(2022, 8, 13, 8, 0, 0),
      end: new Date(2022, 8, 13, 9, 0, 0)
    },
  
    {
      id: 3,
      title: "DTS ENDS",
      start: new Date(2022, 11, 6, 0, 0, 0),
      end: new Date(2022, 11, 7, 0, 0, 0),
      color: '#7737ea'
    },
  
    {
      id: 4,
      title: "Some Event",
      start: new Date(2022, 9, 9, 0, 0, 0),
      end: new Date(2022, 9, 9, 0, 0, 0),
      color: '#e7973e',
    },
    {
      id: 5,
      title: "Conference",
      start: new Date(2022, 9, 11, 12, 0, 0, 0),
      end: new Date(2022, 9, 11, 13, 0, 0, 0),
      desc: "Big conference for important people"
    },
    {
      id: 6,
      title: "Meeting",
      start: new Date(2022, 9, 12, 14, 30, 0, 0),
      end: new Date(2022, 9, 12, 17, 30, 0, 0),
      desc: "Pre-meeting meeting, to prepare for the meeting",
      color: '#e7973e',
    },
    {
      id: 7,
      title: "Lunch",
      start: new Date(2022, 9, 12, 12, 0, 0, 0),
      end: new Date(2022, 9, 12, 13, 0, 0, 0),
      desc: "Power lunch",
      color: '#7737ea'
    },
    {
      id: 8,
      title: "Meeting",
      start: new Date(2022, 9, 12, 7, 0, 0, 0),
      end: new Date(2022, 9, 12, 10, 0, 0, 0)
    },
    {
      id: 9,
      title: "Happy Hour",
      start: new Date(2022, 9, 12, 17, 0, 0, 0),
      end: new Date(2022, 9, 12, 17, 30, 0, 0),
      desc: "Most important meal of the day",
      color: '#7737ea'
    },
    {
      id: 10,
      title: "Dinner",
      start: new Date(2022, 9, 12, 20, 0, 0, 0),
      end: new Date(2022, 9, 12, 21, 0, 0, 0),
      color: '#e7973e',
    },
    {
      id: 11,
      title: "Birthday Party",
      start: new Date(2022, 9, 13, 7, 0, 0),
      end: new Date(2022, 9, 13, 10, 30, 0),
      color: '#7737ea'
    },
    {
      id: 12,
      title: "Late Night Event",
      start: new Date(2022, 9, 17, 19, 30, 0),
      end: new Date(2022, 9, 18, 2, 0, 0)
    },
    {
      id: 13,
      title: "Multi-day Event",
      start: new Date(2022, 8, 20, 12, 30, 0),
      end: new Date(2022, 8, 20, 23, 0, 0),
      color: '#e7973e',
    },
    {
      id: 14,
      title: "Today",
      start: new Date(new Date().setHours(new Date().getHours() - 3)),
      end: new Date(new Date().setHours(new Date().getHours() + 3)),
    }
  ];
  