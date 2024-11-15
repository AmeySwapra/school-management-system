import React, { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Button, Stack, Checkbox, FormControlLabel } from "@mui/material";
import _ from "lodash";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

axios.defaults.baseURL = "https://excel-backend-1-8djc.onrender.com";

const deleteStudents = async (selectedIds) => {
  try {
    const promises = selectedIds.map((id) => axios.delete(`/students/${id}`));
    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error deleting students:", error);
  }
};

const StudentFormPanel = ({ row, student }) => {
  const { id, ...studentData } = student;
  const { control, handleSubmit, watch } = useForm({
    defaultValues: studentData,
  });
  const queryClient = useQueryClient();

  const onSubmit = async (formData) => {
    try {
      await axios.put(`/students/${id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (formData.someBooleanField) {
        studentData.someBooleanField = true;
      }

      queryClient.invalidateQueries({ queryKey: ["students"] });
      row.toggleExpanded(false);
    } catch (error) {
      console.error(
        "Error updating student:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      direction="row"
      flexWrap="wrap"
      columnGap={3}
      rowGap={3}
      sx={{ width: "100%" }}
    >
      {_.keys(studentData).map((item) => {
        const initialValue = studentData[item];
        const isInitiallyDisabled = initialValue === true;

        if (typeof initialValue === "boolean") {
          return (
            <Controller
              key={item}
              control={control}
              name={item}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      disabled={isInitiallyDisabled}
                      onChange={(e) => field.onChange(e.target.checked)}
                      sx={{
                        "& .MuiSvgIcon-root": {
                          border: isInitiallyDisabled ? "2px dotted" : "none",
                          borderRadius: "4px",
                          padding: "4px",
                        },
                      }}
                    />
                  }
                  label={_.upperFirst(item)}
                  sx={{
                    flexBasis: { xs: "100%", sm: "48%", md: "23%" },
                    bgcolor: "white",
                  }}
                />
              )}
            />
          );
        }

        return null;
      })}
      <Button
        type="submit"
        disableElevation
        variant="contained"
        size="large"
        sx={{
          mt: 2,
          width: {
            xs: "100%",
            sm: "auto",
          },
        }}
      >
        Update Details
      </Button>
    </Stack>
  );
};

const StudentsTable = ({ isPending, data }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "phone", header: "Phone Number" },
      { accessorKey: "email", header: "E-mail Address" },
      { accessorKey: "classname", header: "Class Name" },
      { accessorKey: "roll", header: "Roll Number" },
      { accessorKey: "section", header: "Section" },
    ],
    []
  );

  const table = useMaterialReactTable({
    state: {
      isLoading: isPending,
      showProgressBars: isPending,
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 5 },
    },
    columns,
    data: data ?? [],
    enableRowSelection: true,
    muiDetailPanelProps: {
      sx: {
        bgcolor: "#f5f5f5",
      },
    },
    renderDetailPanel: ({ row }) => {
      const student = _.omit(row.original, ["__v"]);
      return <StudentFormPanel student={student} row={row} />;
    },
  });

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <MaterialReactTable table={table} />
    </div>
  );
};

export default StudentsTable;
