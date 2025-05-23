import { useState, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Modal from "@/components/dashboard/Modal";
import { Interviewer } from "@/types/interviewer";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useInterviewers } from "@/contexts/interviewers.context";
import { avatars } from "./avatars";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTitle, DialogActions } from "@/components/ui/dialog";

interface Props {
  interviewer: Interviewer;
}

const AVATAR_OPTIONS = [
  ...avatars,
  { id: 100, img: "/interviewers/Lisa.png" },
  { id: 101, img: "/interviewers/Bob.png" },
];

const AUDIO_OPTIONS = [
  { label: "Lisa (Female)", value: "/audio/Lisa.wav" },
  { label: "Bob (Male)", value: "/audio/Bob.wav" },
];

const interviewerCard = ({ interviewer }: Props) => {
  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editData, setEditData] = useState({
    name: interviewer.name,
    empathy: interviewer.empathy / 10,
    rapport: interviewer.rapport / 10,
    exploration: interviewer.exploration / 10,
    speed: interviewer.speed / 10,
    image: interviewer.image,
    description: interviewer.description || "",
    audio: interviewer.audio || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { fetchInterviewers } = useInterviewers();
  const [gallery, setGallery] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [audioPreview, setAudioPreview] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await axios.delete(`/api/interviewer/${interviewer.id}`);
      setOpen(false);
      fetchInterviewers();
    } catch (err) {
      setError("Failed to delete interviewer");
    }
    setDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      await axios.patch(`/api/interviewer/${interviewer.id}`, {
        ...editData,
        empathy: editData.empathy * 10,
        rapport: editData.rapport * 10,
        exploration: editData.exploration * 10,
        speed: editData.speed * 10,
      });
      setShowEdit(false);
      fetchInterviewers();
    } catch (err) {
      setError("Failed to update interviewer");
    }
    setIsSaving(false);
  };

  return (
    <>
      <Card
        className="p-0 inline-block cursor-pointer hover:scale-105 ease-in-out duration-300 h-40 w-36 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-md relative"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-0">
          <div className="w-full h-28 overflow-hidden">
            <Image
              src={interviewer.image}
              alt="Picture of the interviewer"
              width={200}
              height={40}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <CardTitle className="mt-3 text-base text-center">
            {interviewer.name}
          </CardTitle>
          <div className="absolute top-2 right-2 flex gap-2">
            <Pencil
              size={18}
              className="text-blue-500 cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                setShowEdit(true);
              }}
            />
            <Trash2
              size={18}
              className="text-red-500 cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
            />
          </div>
        </CardContent>
      </Card>
      <Modal
        open={open}
        closeOnOutsideClick={true}
        onClose={() => {
          setOpen(false);
        }}
      >
        <InterviewerDetailsModal interviewer={interviewer} />
      </Modal>
      <Modal
        open={showEdit}
        closeOnOutsideClick={true}
        onClose={() => setShowEdit(false)}
        aria-label="Edit Interviewer Modal"
      >
        <div className="text-center w-[35rem]">
          <h2 className="text-2xl font-semibold mb-4" tabIndex={0}>Edit Interviewer</h2>
          {error && <div className="text-red-500 mb-2" role="alert">{error}</div>}
          <div className="mt-3 p-2 flex flex-row justify-center space-x-10 items-center">
            <div
              className="flex flex-col items-center justify-center overflow-hidden border-4 border-gray-500 rounded-xl h-56 w-52 cursor-pointer"
              onClick={() => setGallery(true)}
              tabIndex={0}
              aria-label="Change Avatar"
              role="button"
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setGallery(true); }}
            >
              {editData.image ? (
                <Image
                  src={editData.image}
                  alt="Picture of the interviewer"
                  width={200}
                  height={40}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div>
                  <span className="mt-3 text-gray-300">No Image</span>
                </div>
              )}
              <div className="text-xs text-center font-medium text-gray-400 mt-2">Change Avatar</div>
            </div>
            <div className="flex flex-col justify-center items-start ml-4">
              <div className="flex flex-row justify-center items-center">
                <h3 className="text-lg font-medium">Name</h3>
                <input
                  type="text"
                  className="border-b-2 focus:outline-none border-gray-500 px-2 py-0.5 ml-3 w-[12.5rem]"
                  value={editData.name}
                  onChange={e => handleEditChange("name", e.target.value)}
                  aria-label="Interviewer Name"
                />
              </div>
              <h3 className="text-lg mt-3 font-medium">Interviewer Settings</h3>
              <div className="ml-5 mt-2 flex flex-col justify-start items-start">
                <div className="flex flex-row justify-between items-center mb-2">
                  <h4 className="w-20 text-left">Empathy</h4>
                  <div className="w-40 space-x-3 ml-3 flex justify-between items-center">
                    <Slider
                      value={[editData.empathy]}
                      max={1}
                      step={0.1}
                      onValueChange={value => handleEditChange("empathy", value[0])}
                    />
                    <span className="w-8 text-left">{editData.empathy}</span>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center mb-2">
                  <h4 className="w-20 text-left">Rapport</h4>
                  <div className="w-40 space-x-3 ml-3 flex justify-between items-center">
                    <Slider
                      value={[editData.rapport]}
                      max={1}
                      step={0.1}
                      onValueChange={value => handleEditChange("rapport", value[0])}
                    />
                    <span className="w-8 text-left">{editData.rapport}</span>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center mb-2">
                  <h4 className="w-20 text-left">Exploration</h4>
                  <div className="w-40 space-x-3 ml-3 flex justify-between items-center">
                    <Slider
                      value={[editData.exploration]}
                      max={1}
                      step={0.1}
                      onValueChange={value => handleEditChange("exploration", value[0])}
                    />
                    <span className="w-8 text-left">{editData.exploration}</span>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center mb-2">
                  <h4 className="w-20 text-left">Speed</h4>
                  <div className="w-40 space-x-3 ml-3 flex justify-between items-center">
                    <Slider
                      value={[editData.speed]}
                      max={1}
                      step={0.1}
                      onValueChange={value => handleEditChange("speed", value[0])}
                    />
                    <span className="w-8 text-left">{editData.speed}</span>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center mb-2">
                  <h4 className="w-20 text-left">Audio</h4>
                  <select
                    className="border-b-2 focus:outline-none border-gray-500 px-2 py-0.5 ml-3 w-[12.5rem]"
                    value={editData.audio}
                    onChange={e => {
                      handleEditChange("audio", e.target.value);
                      setAudioPreview(e.target.value);
                    }}
                    aria-label="Audio Voice"
                  >
                    <option value="">Select Audio</option>
                    {AUDIO_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {editData.audio && (
                    <button
                      className="ml-2 px-2 py-1 bg-gray-200 rounded"
                      aria-label="Play Audio Preview"
                      onClick={e => {
                        e.preventDefault();
                        setAudioPreview(editData.audio);
                        setTimeout(() => {
                          audioRef.current?.play();
                        }, 100);
                      }}
                    >
                      ▶️
                    </button>
                  )}
                  <audio ref={audioRef} src={audioPreview} aria-label="Audio Preview" />
                </div>
                <div className="flex flex-row justify-between items-center mb-2">
                  <h4 className="w-20 text-left">Description</h4>
                  <input
                    type="text"
                    className="border-b-2 focus:outline-none border-gray-500 px-2 py-0.5 ml-3 w-[12.5rem]"
                    value={editData.description}
                    onChange={e => handleEditChange("description", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-end mr-4 mt-4">
            <Button
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-800"
              onClick={handleEditSave}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
        <Modal
          open={gallery}
          closeOnOutsideClick={true}
          onClose={() => setGallery(false)}
          aria-label="Avatar Picker Modal"
        >
          <div className="text-left w-[20rem]">
            <CardTitle className="text-xl text mt-0 p-0 font-semibold " tabIndex={0}>
              Select an Avatar
            </CardTitle>
            <ScrollArea className="mt-3 h-96">
              <div className="flex flex-row flex-wrap justify-center items-center">
                {AVATAR_OPTIONS.map((item) => (
                  <div
                    key={item.id}
                    className={`flex flex-col items-center justify-center border-2 border-gray-500 rounded-xl overflow-hidden m-2 cursor-pointer ${editData.image === item.img ? 'ring-2 ring-indigo-500' : ''}`}
                    onClick={() => {
                      handleEditChange("image", item.img);
                      setGallery(false);
                    }}
                    tabIndex={0}
                    aria-label={`Select avatar ${item.id}`}
                    role="button"
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { handleEditChange("image", item.img); setGallery(false); } }}
                  >
                    <Image alt="avatar" width={125} height={100} src={item.img} />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </Modal>
        <Modal
          open={showDeleteConfirm}
          closeOnOutsideClick={true}
          onClose={() => setShowDeleteConfirm(false)}
          aria-label="Delete Confirmation Modal"
        >
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4" tabIndex={0}>Confirm Deletion</h2>
            <p>Are you sure you want to delete this interviewer?</p>
            <div className="flex flex-row justify-center gap-4 mt-6">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Confirm Delete"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                aria-label="Cancel Delete"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </Modal>
    </>
  );
};

export default interviewerCard;
