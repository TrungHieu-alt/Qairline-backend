export const staticTickets = [
    {
        id: 1,
        flight_id: 1,
        status: "booked",
        timeline: [
            { step: "Đã đặt", date: "2025-05-27T10:00:00", completed: true },
            { step: "Check-in", date: "2025-05-28T06:00:00", completed: false },
            { step: "Khởi hành", date: "2025-05-28T08:00:00", completed: false }
        ]
    },
    {
        id: 2,
        flight_id: 2,
        status: "booked",
        timeline: [
            { step: "Đã đặt", date: "2025-05-27T12:00:00", completed: true },
            { step: "Check-in", date: "2025-05-28T08:00:00", completed: false },
            { step: "Khởi hành", date: "2025-05-28T10:00:00", completed: false }
        ]
    },
    {
        id: 3,
        flight_id: 3,
        status: "canceled",
        timeline: [
            { step: "Đã đặt", date: "2025-05-27T14:00:00", completed: true },
            { step: "Đã hủy", date: "2025-05-27T16:00:00", completed: true }
        ]
    }
];