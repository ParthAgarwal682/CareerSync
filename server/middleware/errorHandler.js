const errorHandler = (err, req, res, next) => {
  console.error('Error Details:', err);

  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected server error occurred';

  // MySQL Error Handling
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    code = 'DUPLICATE';
    // Parse which field is duplicated from the error message
    const errMsg = err.message || '';
    if (errMsg.includes('user.email') || errMsg.includes("key 'user.email'")) {
      message = 'An account with this email already exists.';
    } else if (errMsg.includes('student.roll_no') || errMsg.includes("key 'student.roll_no'") || errMsg.includes("key 'roll_no'")) {
      message = 'A student with this roll number already exists.';
    } else if (errMsg.includes('student_id, job_id') || errMsg.includes("key 'student_id'")) {
      message = 'You have already applied for this job.';
    } else {
      message = 'Record already exists. Duplicate entry.';
    }
  } else if (err.code === 'ER_SIGNAL_EXCEPTION' || err.sqlState === '45000') {
    // Custom errors thrown by our triggers via SIGNAL SQLSTATE
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = err.sqlMessage || err.message;
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 400;
    code = 'FOREIGN_KEY_VIOLATION';
    message = 'Foreign key constraint fails. Related record might not exist or is currently in use.';
  } else if (err.status) { // Allow custom thrown errors with specific status codes
    statusCode = err.status;
    code = err.code || 'API_ERROR';
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  });
};

module.exports = { errorHandler };
