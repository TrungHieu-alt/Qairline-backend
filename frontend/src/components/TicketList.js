function TicketList({ tickets, onCancel }) {
    return (
        <div className="space-y-4">
            {tickets.map(ticket => (
                <div key={ticket.id} className="p-4 bg-white shadow-md rounded-lg">
                    <p className="font-semibold">Vé #{ticket.id} - Chuyến bay #{ticket.flight_id}</p>
                    <p>Trạng thái: {ticket.status === 'booked' ? 'Đã đặt' : 'Đã hủy'}</p>
                    <button
                        onClick={() => onCancel(ticket.id)}
                        className={`p-2 mt-2 rounded ${ticket.status === 'canceled' ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white transition'}`}
                        disabled={ticket.status === 'canceled'}
                    >
                        Hủy vé
                    </button>
                </div>
            ))}
        </div>
    );
}

export default TicketList;