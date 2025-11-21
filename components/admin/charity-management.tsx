"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Check, X, Globe, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Charity {
  id: string;
  name: string;
  description?: string;
  stripe_account_id?: string;
  website_url?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function CharityManagement() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [deleteCharity, setDeleteCharity] = useState<Charity | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stripe_account_id: "",
    website_url: "",
    logo_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/charities");
      if (response.ok) {
        const data = await response.json();
        setCharities(data || []);
      }
    } catch (error) {
      console.error("Error fetching charities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCharity(null);
    setFormData({
      name: "",
      description: "",
      stripe_account_id: "",
      website_url: "",
      logo_url: "",
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (charity: Charity) => {
    setEditingCharity(charity);
    setFormData({
      name: charity.name,
      description: charity.description || "",
      stripe_account_id: charity.stripe_account_id || "",
      website_url: charity.website_url || "",
      logo_url: charity.logo_url || "",
      is_active: charity.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = editingCharity
        ? `/api/admin/charities/${editingCharity.id}`
        : "/api/admin/charities";
      const method = editingCharity ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setDialogOpen(false);
        fetchCharities();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save charity");
      }
    } catch (error) {
      console.error("Error saving charity:", error);
      alert("Failed to save charity");
    }
  };

  const handleDelete = async () => {
    if (!deleteCharity) return;

    try {
      const response = await fetch(`/api/admin/charities/${deleteCharity.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteCharity(null);
        fetchCharities();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete charity");
      }
    } catch (error) {
      console.error("Error deleting charity:", error);
      alert("Failed to delete charity");
    }
  };

  const handleToggleActive = async (charity: Charity) => {
    try {
      const response = await fetch(`/api/admin/charities/${charity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !charity.is_active }),
      });

      if (response.ok) {
        fetchCharities();
      }
    } catch (error) {
      console.error("Error toggling charity status:", error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading charities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manage Charities</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage charity organizations
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Charity
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {charities.map((charity) => (
          <Card key={charity.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{charity.name}</CardTitle>
                <Badge
                  variant={charity.is_active ? "default" : "secondary"}
                  className={cn(
                    charity.is_active
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  )}
                >
                  {charity.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              {charity.description && (
                <CardDescription className="line-clamp-2">
                  {charity.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {charity.website_url && (
                <a
                  href={charity.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              {charity.stripe_account_id && (
                <p className="text-xs text-muted-foreground">
                  Stripe: {charity.stripe_account_id.slice(0, 20)}...
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(charity)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={charity.is_active ? "secondary" : "default"}
                  onClick={() => handleToggleActive(charity)}
                >
                  {charity.is_active ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteCharity(charity)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {charities.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No charities found</p>
            <Button onClick={handleCreate}>Add First Charity</Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCharity ? "Edit Charity" : "Create Charity"}
            </DialogTitle>
            <DialogDescription>
              {editingCharity
                ? "Update charity information"
                : "Add a new charity to the platform"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Charity name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Charity description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) =>
                  setFormData({ ...formData, website_url: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) =>
                  setFormData({ ...formData, logo_url: e.target.value })
                }
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripe_account_id">Stripe Account ID</Label>
              <Input
                id="stripe_account_id"
                value={formData.stripe_account_id}
                onChange={(e) =>
                  setFormData({ ...formData, stripe_account_id: e.target.value })
                }
                placeholder="acct_..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteCharity}
        onOpenChange={(open) => !open && setDeleteCharity(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Charity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteCharity?.name}"? This
              action cannot be undone. If the charity is used in bets, you
              should deactivate it instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

