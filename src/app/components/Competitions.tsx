"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import {
  Competition,
  CreateCompetitionData,
} from "../types/competition";
import * as Tooltip from "@radix-ui/react-tooltip";

interface Tenant {
  name: string;
  id: string;
  subdomain: string;
}

export default function Competitions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [isCustomRival, setIsCustomRival] = useState(false);
  const [formData, setFormData] = useState<CreateCompetitionData>({
    title: "",
    description: "",
    start_at: new Date(),
    end_at: new Date(),
    visibility: "restricted",
    rival_team_name: "",
    allowedTenantIds: [user?.tenant_id || ""],
  });

  const isAdmin = user?.role === "admin";

  const { data: tenants } = useQuery<Tenant[]>({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/subdomain/tenants");
      return data;
    },
  });

  const { data: competitions, isLoading } = useQuery<Competition[]>({
    queryKey: ["competitions"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/competitions");
      return data;
    },
  });

  const createCompetition = useMutation({
    mutationFn: async (competitionData: CreateCompetitionData) => {
      const { data } = await axiosInstance.post("/competitions", {
        ...competitionData,
        ownerTenantId: user?.tenant_id,
        createdBy: user?.id,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      setIsFormOpen(false);
      resetForm();
    },
  });

  const updateCompetition = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCompetitionData>;
    }) => {
      const { data: response } = await axiosInstance.put(
        `/competitions/${id}`,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      setEditingCompetition(null);
      resetForm();
    },
  });

  const deleteCompetition = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(`/competitions/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
    },
  });

  if (!user?.id) return undefined;

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      start_at: new Date(),
      end_at: new Date(),
      visibility: "restricted",
      rival_team_name: "",
      allowedTenantIds: [user?.tenant_id || ""],
    });
    setIsCustomRival(false);
  };

  const handleEdit = (competition: Competition) => {
    setEditingCompetition(competition);
    setFormData({
      title: competition.title,
      description: competition.description,
      start_at: new Date(competition.start_at),
      end_at: new Date(competition.end_at),
      visibility: competition.visibility,
      rival_team_name: competition.rival_team_name,
      allowedTenantIds: [user?.tenant_id || ""],
    });
    setIsCustomRival(
      !tenants?.some((tenant) => tenant.name === competition.rival_team_name)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCompetition) {
      updateCompetition.mutate({
        id: editingCompetition.id,
        data: formData,
      });
    } else {
      createCompetition.mutate(formData);
    }
  };
  const canEditCompetition = (competition: Competition) => {
    return isAdmin && competition.owner_tenant_id === user?.tenant_id;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name === "rival_team_name") {
      const selectedTenant = tenants?.find((tenant) => tenant.name === value);
      setFormData((prev) => ({
        ...prev,
        rival_team_name: value,
        allowedTenantIds: selectedTenant
          ? [user?.tenant_id || "", selectedTenant.id]
          : [user?.tenant_id || ""],
      }));
    } else if (name === "custom_rival_team") {
      setFormData((prev) => ({
        ...prev,
        rival_team_name: value,
        allowedTenantIds: [user?.tenant_id || ""],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? (e.target as HTMLInputElement).checked
              ? "public"
              : "restricted"
            : value,
      }));
    }
  };

  const handleCustomRivalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomRival(e.target.checked);
    if (!e.target.checked) {
      setFormData((prev) => ({
        ...prev,
        rival_team_name: "",
        allowedTenantIds: [user?.tenant_id || ""],
      }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: new Date(value),
    }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this competition?")) {
      deleteCompetition.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading competitions...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Competitions</h1>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => {
                  setIsFormOpen(!isFormOpen);
                  if (!isFormOpen) {
                    setEditingCompetition(null);
                    resetForm();
                  }
                }}
                disabled={!isAdmin}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isAdmin
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isFormOpen ? "Cancel" : "Add Competition"}
              </button>
            </Tooltip.Trigger>
            {!isAdmin && (
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm"
                  sideOffset={5}
                >
                  You have to be admin to add a new competition
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            )}
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>

      {(isFormOpen || editingCompetition) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md mb-8"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  name="start_at"
                  value={formData.start_at.toISOString().slice(0, 16)}
                  onChange={handleDateChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  name="end_at"
                  value={formData.end_at.toISOString().slice(0, 16)}
                  onChange={handleDateChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="visibility"
                        checked={formData.visibility === "public"}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Make Public
                      </span>
                    </label>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm"
                      sideOffset={5}
                    >
                      Making the competition public will let everyone access it
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rival Team
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={isCustomRival}
                    onChange={handleCustomRivalChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Custom Rival Team
                  </span>
                </label>

                {isCustomRival ? (
                  <input
                    type="text"
                    name="custom_rival_team"
                    value={formData.rival_team_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter custom rival team name"
                  />
                ) : (
                  <select
                    name="rival_team_name"
                    value={formData.rival_team_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a rival team</option>
                    {tenants?.map((tenant) => {
                      if (tenant.id === user?.tenant_id) return null;
                      return (
                        <option key={tenant.id} value={tenant.name}>
                          {tenant.name}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={
                  createCompetition.isPending || updateCompetition.isPending
                }
                className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold ${
                  createCompetition.isPending || updateCompetition.isPending
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                {createCompetition.isPending || updateCompetition.isPending
                  ? editingCompetition
                    ? "Updating..."
                    : "Creating..."
                  : editingCompetition
                  ? "Update Competition"
                  : "Create Competition"}
              </button>
              {editingCompetition && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCompetition(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel Editing
                </button>
              )}
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {competitions?.map((competition) => (
          <div
            key={competition.id}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {competition.title}
                </h2>
                <p className="text-gray-600 mb-4">{competition.description}</p>
              </div>
              <Tooltip.Provider>
                <Tooltip.Root>
                  <div className="flex space-x-2">
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={() => handleEdit(competition)}
                        disabled={!canEditCompetition(competition)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          canEditCompetition(competition)
                            ? "text-blue-600 hover:text-blue-700"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Edit
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={() => handleDelete(competition.id)}
                        disabled={
                          !canEditCompetition(competition) ||
                          deleteCompetition.isPending
                        }
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          canEditCompetition(competition)
                            ? "text-red-600 hover:text-red-700"
                            : "text-gray-400 cursor-not-allowed"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {deleteCompetition.isPending ? "Deleting..." : "Delete"}
                      </button>
                    </Tooltip.Trigger>
                  </div>
                  {!canEditCompetition(competition) && (
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm max-w-xs"
                        sideOffset={5}
                      >
                        Only administrators that belong to the same school that
                        created the competition can edit or modify competitions
                        <Tooltip.Arrow className="fill-gray-900" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  )}
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Start:</span>{" "}
                {new Date(competition.start_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">End:</span>{" "}
                {new Date(competition.end_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Visibility:</span>{" "}
                {competition.visibility}
              </div>
              <div>
                <span className="font-medium">Rival Team:</span>{" "}
                {competition.rival_team_name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
