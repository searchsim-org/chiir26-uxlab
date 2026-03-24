/**
 * Study API Service
 * 
 * Provides typed API client functions for interacting with the UXLab backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============================================================================
// Types
// ============================================================================

export interface Study {
    id: number;
    name: string;
    description: string | null;
    status: string;
    design_type: string;
    target_participants: number;
    configuration_json: string | null;
    procedure_json: string | null;
    created_at: string;
    updated_at: string;
    participant_count: number;
    completion_rate: number;
}

export interface StudyCreate {
    name: string;
    description?: string;
    design_type?: string;
    target_participants?: number;
    configuration_json?: string;
    procedure_json?: string;
}

export interface StudyUpdate {
    name?: string;
    description?: string;
    status?: string;
    design_type?: string;
    target_participants?: number;
    configuration_json?: string;
    procedure_json?: string;
}

export interface Participant {
    id: number;
    external_id: string;
    external_platform: string | null;
    study_id: number;
    condition_order: string[] | null;
    current_step: number;
    status: string;
    started_at: string;
    completed_at: string | null;
    completion_code: string | null;
}

export interface Backend {
    id: number;
    name: string;
    connector_type: string;
    config_json: string;
    health_status: string;
    last_health_check: string | null;
    created_at: string;
    updated_at: string;
}

export interface BackendCreate {
    name: string;
    connector_type: string;
    config_json: string;
}

export interface GlobalStats {
    total_studies: number;
    active_studies: number;
    draft_studies: number;
    completed_studies: number;
    total_participants: number;
    completed_participants: number;
    overall_completion_rate: number;
    total_interactions: number;
}

// ============================================================================
// Study API
// ============================================================================

export async function getStudies(): Promise<{ studies: Study[]; total: number }> {
    const response = await fetch(`${API_BASE}/api/v1/studies`);
    if (!response.ok) throw new Error('Failed to fetch studies');
    return response.json();
}

export async function getStudy(id: number): Promise<Study> {
    const response = await fetch(`${API_BASE}/api/v1/studies/${id}`);
    if (!response.ok) throw new Error('Failed to fetch study');
    return response.json();
}

export async function createStudy(study: StudyCreate): Promise<Study> {
    const response = await fetch(`${API_BASE}/api/v1/studies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(study),
    });
    if (!response.ok) throw new Error('Failed to create study');
    return response.json();
}

export async function updateStudy(id: number, study: StudyUpdate): Promise<Study> {
    const response = await fetch(`${API_BASE}/api/v1/studies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(study),
    });
    if (!response.ok) throw new Error('Failed to update study');
    return response.json();
}

export async function deleteStudy(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/v1/studies/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete study');
}

export async function duplicateStudy(id: number): Promise<Study> {
    const response = await fetch(`${API_BASE}/api/v1/studies/${id}/duplicate`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to duplicate study');
    return response.json();
}

export async function activateStudy(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/v1/studies/${id}/activate`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to activate study');
}

export async function pauseStudy(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/v1/studies/${id}/pause`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to pause study');
}

export async function exportStudyConfig(id: number): Promise<object> {
    const response = await fetch(`${API_BASE}/api/v1/studies/${id}/export/json`);
    if (!response.ok) throw new Error('Failed to export study');
    return response.json();
}

export async function importStudyConfig(config: object): Promise<Study> {
    const response = await fetch(`${API_BASE}/api/v1/studies/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Failed to import study');
    return response.json();
}

// ============================================================================
// Participant API
// ============================================================================

export async function getParticipants(studyId: number): Promise<{
    participants: Participant[];
    total: number;
    active: number;
    completed: number;
    dropped: number;
}> {
    const response = await fetch(`${API_BASE}/api/v1/studies/${studyId}/participants`);
    if (!response.ok) throw new Error('Failed to fetch participants');
    return response.json();
}

export async function registerParticipant(
    studyId: number,
    externalId: string,
    platform?: string
): Promise<Participant> {
    const response = await fetch(`${API_BASE}/api/v1/studies/${studyId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            external_id: externalId,
            external_platform: platform,
        }),
    });
    if (!response.ok) throw new Error('Failed to register participant');
    return response.json();
}

export async function getParticipantState(studyId: number, participantId: number): Promise<{
    participant_id: number;
    study_id: number;
    study_name: string;
    current_step: number;
    total_steps: number;
    current_condition: string | null;
    condition_order: string[] | null;
    status: string;
    procedure: { steps: any[] } | null;
}> {
    const response = await fetch(
        `${API_BASE}/api/v1/studies/${studyId}/participants/${participantId}/state`
    );
    if (!response.ok) throw new Error('Failed to fetch participant state');
    return response.json();
}

// ============================================================================
// Backend Configuration API
// ============================================================================

export async function getBackends(): Promise<{ backends: Backend[]; total: number }> {
    const response = await fetch(`${API_BASE}/api/v1/backends`);
    if (!response.ok) throw new Error('Failed to fetch backends');
    return response.json();
}

export async function getBackend(id: number): Promise<Backend> {
    const response = await fetch(`${API_BASE}/api/v1/backends/${id}`);
    if (!response.ok) throw new Error('Failed to fetch backend');
    return response.json();
}

export async function createBackend(backend: BackendCreate): Promise<Backend> {
    const response = await fetch(`${API_BASE}/api/v1/backends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backend),
    });
    if (!response.ok) throw new Error('Failed to create backend');
    return response.json();
}

export async function deleteBackend(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/v1/backends/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete backend');
}

export async function testBackend(id: number): Promise<{
    status: string;
    message: string;
    checked_at: string;
}> {
    const response = await fetch(`${API_BASE}/api/v1/backends/${id}/test`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to test backend');
    return response.json();
}

export async function getConnectorSchemas(): Promise<Record<string, any>> {
    const response = await fetch(`${API_BASE}/api/v1/backends/schemas`);
    if (!response.ok) throw new Error('Failed to fetch schemas');
    return response.json();
}

// ============================================================================
// Export API
// ============================================================================

export async function downloadStudyCSV(studyId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/v1/export/${studyId}/csv`);
    if (!response.ok) throw new Error('Failed to export CSV');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `study_${studyId}_export.csv`;
    if (contentDisposition) {
        const match = contentDisposition.match(/filename=([^;]+)/);
        if (match) filename = match[1];
    }

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}

export async function getStudyStats(studyId: number): Promise<{
    study_id: number;
    study_name: string;
    total_participants: number;
    active: number;
    completed: number;
    dropped: number;
    completion_rate: number;
    total_interactions: number;
    avg_session_duration_seconds: number;
}> {
    const response = await fetch(`${API_BASE}/api/v1/export/${studyId}/stats`);
    if (!response.ok) throw new Error('Failed to fetch study stats');
    return response.json();
}

export async function getGlobalStats(): Promise<GlobalStats> {
    const response = await fetch(`${API_BASE}/api/v1/export/global/stats`);
    if (!response.ok) throw new Error('Failed to fetch global stats');
    return response.json();
}

// ============================================================================
// Utility
// ============================================================================

export function getStudyURL(studyId: number): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/?study_id=${studyId}`;
}

export function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
}
