# From SERPs to Agents: A Platform for Comparative Studies of Information Interaction

<p align="center">
  <img src="assets/images/uxlab_overview.png" alt="UXLab Overview" width="800"/>
</p>

[![Paper](https://img.shields.io/badge/Paper-arXiv-b31b1b?style=flat-square)](https://arxiv.org)
[![Demo](https://img.shields.io/badge/Demo-uxlab.searchsim.org-blue?style=flat-square)](https://uxlab.searchsim.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

This repository contains the source code for **UXLab**, an open-source system for web-based user studies enabling the complete, no-code configuration of complex experimental designs.

---

## Abstract

The diversification of information access systems, from RAG to autonomous agents, creates a critical need for comparative user studies. However, the technical overhead to deploy and manage these distinct systems is a major barrier. We present UXLab, an open-source system for web-based user studies that addresses this challenge. Its core is a web-based dashboard enabling the complete, no-code configuration of complex experimental designs. Researchers can visually manage the full study, from recruitment to comparing backends like traditional search, vector databases, and LLMs. We demonstrate UXLab's value via a micro case study comparing user behavior with RAG versus an autonomous agent. UXLab allows researchers to focus on experimental design and analysis, supporting future multi-modal interaction research.

**Keywords**: User studies, Human-AI interaction, Autonomous agents

---

## System Architecture

<p align="center">
  <img src="assets/images/uxlab_flow.png" alt="UXLab Workflow" width="500"/>
</p>

UXLab consists of four core components:

1. **Backend**: FastAPI-based server managing study logic, participant assignment, and data persistence
2. **Experimenter Dashboard**: Web interface for no-code study configuration and management
3. **Participant Interface**: Minimalistic frontend for study execution and data collection
4. **Service Connectors**: Modular library for integrating external search, RAG, and agentic systems

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Ollama](https://ollama.com/download) (optional, for local models)
  - Download supported models: llama3, mistral, gemma
  - Start ollama server: `ollama serve`

### 1. Clone the Repository

```bash
git clone https://github.com/searchsim-org/uxlab.git
cd uxlab
```

### 2. Configure Environment

```bash
touch .env
```

Add the following to `.env`:

```bash
# Required
BING_API_KEY=your_bing_api_key

# Optional (Pre-configured Defaults)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_LOCAL_MODE_ENABLED=true
ENABLE_LOCAL_MODELS=True
```

### 3. Launch with Docker

Requires Docker Compose version 2.22.0 or later:

```bash
docker-compose -f docker-compose.dev.yaml up -d
```

Visit [http://localhost:3000](http://localhost:3000) to access the dashboard.

---

## Features

- **No-Code Configuration**: Visual editor for building complex experimental procedures
- **Modular Backend System**: Easy integration of traditional search, RAG, and agentic systems
- **Study Design Support**: Between-subject, within-subject, and time-delayed experiments
- **Built-in Counterbalancing**: Automatic participant assignment with Latin square design
- **Real-time Monitoring**: Track participant progress and export timestamped logs
- **Reproducibility**: Export complete study configurations as shareable JSON files

---

## Citation

If you use UXLab in your research, please cite our paper:

```bibtex
@inproceedings{zerhoudi2025uxlab,
  title={From SERPs to Agents: A Platform for Comparative Studies of Information Interaction},
  author={Zerhoudi, Saber and Granitzer, Michael},
  booktitle={Proceedings of the Conference},
  year={2025}
}
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

For questions or support, please open an issue on GitHub or visit [uxlab.searchsim.org](https://uxlab.searchsim.org).
