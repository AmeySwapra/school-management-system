import { Container, Stack, Grid } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import StudentsTable from "./StudentTable.jsx";

const getStudents = async () => axios.get("/students");
const createManyStudents = async (data) => axios.post("/students", data);

function App() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createManyStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const {
    isPending,
    error,
    data: res,
  } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 4,
        "@media (max-width: 600px)": {
          padding: 2, 
        },
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              "@media (max-width: 600px)": {
                flexDirection: "column", 
              },
            }}
          >
            
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <StudentsTable
            isPending={isPending || mutation.isPending}
            data={res?.data}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
