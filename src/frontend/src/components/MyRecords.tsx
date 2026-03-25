import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Archive,
  ExternalLink,
  FileText,
  MoreVertical,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { HealthRecord, RecordCategory } from "../types/records";
import { ALL_CATEGORIES } from "../types/records";
import CategoryBadge from "./CategoryBadge";
import StatusBadge from "./StatusBadge";

interface MyRecordsProps {
  records: HealthRecord[];
  onUpload: () => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

type SortKey = "date" | "name" | "category";
type FilterCategory = RecordCategory | "All";

export default function MyRecords({
  records,
  onUpload,
  onDelete,
  onArchive,
}: MyRecordsProps) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<FilterCategory>("All");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = records
    .filter((r) => {
      const matchesCat = filterCat === "All" || r.category === filterCat;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.date.localeCompare(b.date);
      else if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "category")
        cmp = a.category.localeCompare(b.category);
      return sortAsc ? cmp : -cmp;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search records, providers…"
            className="pl-9 rounded-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="records.search_input"
          />
        </div>
        <Button
          className="bg-navy hover:bg-navy/90 text-white shrink-0"
          onClick={onUpload}
          data-ocid="records.upload_button"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap" data-ocid="records.filter.tab">
        {(["All", ...ALL_CATEGORIES] as const).map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterCat === cat
                ? "bg-teal text-white"
                : "bg-card border border-border text-muted-foreground hover:border-teal/50 hover:text-teal"
            }`}
            data-ocid="records.tab"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="border border-border shadow-card">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              data-ocid="records.empty_state"
            >
              <FileText className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No records found
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {search
                  ? "Try a different search term"
                  : "Upload your first document"}
              </p>
              {!search && (
                <Button
                  size="sm"
                  className="mt-4 bg-navy hover:bg-navy/90 text-white"
                  onClick={onUpload}
                >
                  Upload Document
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:text-teal select-none"
                    onClick={() => toggleSort("name")}
                  >
                    Name {sortKey === "name" ? (sortAsc ? "↑" : "↓") : ""}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-teal select-none"
                    onClick={() => toggleSort("date")}
                  >
                    Date {sortKey === "date" ? (sortAsc ? "↑" : "↓") : ""}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-teal select-none"
                    onClick={() => toggleSort("category")}
                  >
                    Category{" "}
                    {sortKey === "category" ? (sortAsc ? "↑" : "↓") : ""}
                  </TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((rec, i) => (
                  <TableRow
                    key={rec.id}
                    className="hover:bg-accent/30"
                    data-ocid={`records.item.${i + 1}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                            {rec.name}
                          </p>
                          {rec.notes && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {rec.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {rec.date}
                    </TableCell>
                    <TableCell>
                      <CategoryBadge category={rec.category} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {rec.provider}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={rec.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            data-ocid="records.dropdown_menu"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rec.blobUrl && (
                            <DropdownMenuItem
                              onClick={() => window.open(rec.blobUrl, "_blank")}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open File
                            </DropdownMenuItem>
                          )}
                          {rec.status === "Active" && (
                            <DropdownMenuItem
                              onClick={() => onArchive(rec.id)}
                              data-ocid="records.secondary_button"
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(rec.id)}
                            data-ocid="records.delete_button"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-right">
        {filtered.length} of {records.length} records
      </p>
    </motion.div>
  );
}
