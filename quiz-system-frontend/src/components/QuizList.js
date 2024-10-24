// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { getAllQuizzes } from '../api';
// import { 
//   Container, Typography, List, ListItem, ListItemText, 
//   Button, Box 
// } from '@mui/material';

// function QuizList() {
//   const [quizzes, setQuizzes] = useState([]);
//   const [error, setError] = useState('');
//   const currentUserId = localStorage.getItem('userId');

//   useEffect(() => {
//     fetchQuizzes();
//   }, []);

//   const fetchQuizzes = async () => {
//     try {
//       const fetchedQuizzes = await getAllQuizzes();
//       setQuizzes(fetchedQuizzes);
//     } catch (error) {
//       setError('Failed to fetch quizzes. Please try again.');
//       console.error('Error fetching quizzes:', error);
//     }
//   };

//   return (
//     <Container maxWidth="md">
//       <Typography variant="h4" component="h1" gutterBottom>
//         Available Quizzes
//       </Typography>
//       {error && <Typography color="error">{error}</Typography>}
//       <List>
//         {quizzes.map((quiz) => (
//           <ListItem key={quiz.id} divider>
//             <ListItemText primary={quiz.title} secondary={quiz.description} />
//             <Box>
//               <Button 
//                 component={Link} 
//                 to={`/quiz/${quiz.id}`} 
//                 variant="contained" 
//                 color="primary" 
//                 style={{ marginRight: '10px' }}
//               >
//                 Take Quiz
//               </Button>
//               {currentUserId === quiz.creatorId && (
//                 <Button 
//                   component={Link} 
//                   to={`/edit-quiz/${quiz.id}`} 
//                   variant="contained" 
//                   color="secondary"
//                 >
//                   Edit
//                 </Button>
//               )}
//             </Box>
//           </ListItem>
//         ))}
//       </List>
//     </Container>
//   );
// }

// export default QuizList;