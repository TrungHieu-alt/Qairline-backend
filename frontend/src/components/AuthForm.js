import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

function AuthForm({ type, onSubmit }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {type === 'register' && (
          <>
            <div>
              <label className="block text-gray-700 mb-2">Tên đăng nhập</label>
              <input
                type="text"
                {...register('username')} // Không bắt buộc
                className="p-2 border rounded w-full"
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Họ</label>
              <input
                type="text"
                {...register('last_name')} // Không bắt buộc
                className="p-2 border rounded w-full"
              />
              {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Tên</label>
              <input
                type="text"
                {...register('first_name', { required: 'Tên là bắt buộc' })}
                className="p-2 border rounded w-full"
              />
              {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name.message}</p>}
            </div>
          </>
        )}
        <div>
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            {...register('email', { required: 'Email là bắt buộc', pattern: { value: /^\S+@\S+$/i, message: 'Email không hợp lệ' } })}
            className="p-2 border rounded w-full"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Mật khẩu</label>
          <input
            type="password"
            {...register('password', { required: 'Mật khẩu là bắt buộc', minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' } })}
            className="p-2 border rounded w-full"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition w-full"
        >
          {type === 'login' ? 'Đăng nhập' : 'Đăng ký'}
        </motion.button>
      </form>
    </motion.div>
  );
}

export default AuthForm;