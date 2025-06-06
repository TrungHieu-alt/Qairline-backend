import { motion } from 'framer-motion';
import FlightCard from './FlightCard';

function FlightList({ flights, navigate }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {flights.map((flight, index) => (
                <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <FlightCard flight={flight} navigate={navigate} />
                </motion.div>
            ))}
        </div>
    );
}

export default FlightList;