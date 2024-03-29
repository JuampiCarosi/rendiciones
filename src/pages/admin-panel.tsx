import { GetServerSideProps, NextPage } from "next";

import Top from "../components/Top";
import { Fragment, useState } from "react";
import { getNextWednesday, parsePettyCashDate } from "../utils/helpers";
import { FileKey, FileLineChart, Store, Trash2, UserSquare2, X } from "lucide-react";
import { trpc } from "../utils/trpc";
import clsx from "clsx";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { Toaster } from "react-hot-toast";
import { Dialog, Transition } from "@headlessui/react";
import { useTable } from "../utils/useTable";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "../components/Input";
import { dialog } from "../utils/dialog";

const Home: NextPage = () => {
  const [currentPettyCash, setCurrentPettyCash] = useState<Date>(getNextWednesday(new Date()));
  const generateReportMutation = trpc.balances.generateReport.useMutation();
  const generateAfipReportMutation = trpc.balances.generateAfipReport.useMutation();
  const [showCostCenterModal, setShowCostCenterModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

  return (
    <div>
      <Top currentPettyCash={currentPettyCash} setPettyCash={setCurrentPettyCash} />
      <CostCentersModal
        show={showCostCenterModal}
        handleShow={(show: boolean) => setShowCostCenterModal(show)}
      />
      <UsersModal show={showUsersModal} handleShow={setShowUsersModal} />

      <div className="mx-5 flex  flex-col gap-3 pt-20">
        <div
          onClick={() =>
            !generateReportMutation.isLoading &&
            generateReportMutation.mutate(getNextWednesday(currentPettyCash), {
              onSuccess: ({ report }) => {
                const mediaType =
                  "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
                const a = document.createElement("a");
                a.href = `${mediaType}${report}`;
                a.download = `${parsePettyCashDate(currentPettyCash).label}.xlsx`;
                a.click();
              },
            })
          }
          className="flex cursor-pointer  items-center gap-3  border-b border-slate-400 pt-2 pb-4 text-slate-600 hover:underline "
        >
          <FileLineChart />
          <h3 className={clsx("text-xl", generateReportMutation.isLoading && "text-slate-500 ")}>
            {generateReportMutation.isLoading ? "Generando Reporte..." : "Generar Reporte"}
          </h3>
        </div>
        <div
          onClick={() =>
            !generateAfipReportMutation.isLoading &&
            generateAfipReportMutation.mutate(currentPettyCash, {
              onSuccess: ({ report }) => {
                const mediaType =
                  "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
                const a = document.createElement("a");
                a.href = `${mediaType}${report}`;
                a.download = `afip.xlsx`;
                a.click();
              },
            })
          }
          className="flex cursor-pointer  items-center gap-3  border-b border-slate-400 pt-2 pb-4 text-slate-600 hover:underline "
        >
          <FileKey />
          <h3 className={clsx("text-xl", generateAfipReportMutation.isLoading && "text-slate-500 ")}>
            {generateAfipReportMutation.isLoading ? "Generando Reporte AFIP..." : "Generar Reporte AFIP"}
          </h3>
        </div>
        <div
          onClick={() => setShowCostCenterModal(true)}
          className="flex cursor-pointer  items-center gap-3  border-b border-slate-400 pt-2 pb-4 text-slate-600 hover:underline"
        >
          <Store />
          <h3 className=" text-xl ">Administrar Centro de Costos</h3>
        </div>
        <div
          onClick={() => setShowUsersModal(true)}
          className="flex cursor-pointer  items-center gap-3  border-b border-slate-400 pt-2 pb-4 text-slate-600 hover:underline"
        >
          <UserSquare2 />
          <h3 className=" text-xl ">Administrar Usuarios</h3>
        </div>
      </div>
    </div>
  );
};

const CostCentersModal = ({ handleShow, show }: { show: boolean; handleShow: (show: boolean) => void }) => {
  const utils = trpc.useContext();

  const { data: costCenters } = trpc.admin.getCosCenters.useQuery();
  const deleteCostCenterMutation = trpc.admin.deleteCostCenter.useMutation({
    onSuccess: () => {
      utils.admin.invalidate();
    },
  });

  const { rows: costCenterRows, DataTable: CostCenterTable } = useTable({
    rows: costCenters,
  });

  const [showInputModal, setShowInputModal] = useState(false);

  return (
    <>
      <CostCenterInputModal
        show={showInputModal}
        handleClose={() => {
          setShowInputModal(false);
        }}
      />
      <Toaster position="top-center" reverseOrder={false} />
      {show && <div className="fixed inset-0 z-20 bg-black/30 transition-opacity" aria-hidden="true"></div>}
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        show={show}
        as={Fragment}
      >
        <Dialog onClose={() => handleShow(false)} className="fixed inset-0 z-30 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center sm:block sm:p-0">
            <Dialog.Panel
              className="fixed top-[50%] left-[50%] z-50 w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] overflow-hidden rounded-lg bg-white px-5 py-6 shadow-xl transition-all focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 sm:my-8 sm:w-full sm:max-w-lg sm:align-middle md:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className=" mb-4">
                <Dialog.Title className="text-md font-medium leading-6 text-gray-900">
                  Administrar Centro de Costos
                </Dialog.Title>
                <X
                  className="absolute right-4 top-4 h-4 w-4 cursor-pointer text-gray-400"
                  onClick={() => handleShow(false)}
                />
              </div>

              <CostCenterTable.Root rounded="all">
                <CostCenterTable.Head>
                  <CostCenterTable.Column accessor="name" label="Nombre" align="center" />
                  <CostCenterTable.Column accessorAlias="actions" label="Acciones" align="center" />
                </CostCenterTable.Head>
                <CostCenterTable.Body>
                  {costCenterRows.map(({ row }) => (
                    <CostCenterTable.Row key={row.id.toString()} row={row}>
                      <CostCenterTable.Cell className=" text-lg" accessor="name" align="center" />
                      <CostCenterTable.Cell accessorAlias="actions" align="center">
                        <div className="space-x-4">
                          <button
                            onClick={async () => {
                              const confirm = await dialog({
                                title: "Eliminar Centro de Costos",
                                description: `¿Estás seguro que deseas eliminar el centro de costos ${row.name}?`,
                              });

                              if (confirm) {
                                deleteCostCenterMutation.mutate(Number(row.id));
                              }
                            }}
                            className=" rounded-md bg-red-600 p-0.5 text-white"
                          >
                            <Trash2 className="h-5 w-5 " />
                          </button>
                        </div>
                      </CostCenterTable.Cell>
                    </CostCenterTable.Row>
                  ))}
                </CostCenterTable.Body>
              </CostCenterTable.Root>

              <div className="flex w-full justify-end pt-2">
                <button
                  onClick={() => setShowInputModal(true)}
                  className="mt-2 inline-flex w-full justify-center rounded-md border border-indigo-600 bg-indigo-600 px-4 py-2 text-base  font-medium text-white shadow-sm hover:bg-indigo-700  sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Agregar nuevo centro de costos
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

const CostCenterInputModal = ({ handleClose, show }: { show: boolean; handleClose: () => void }) => {
  const {
    register,
    handleSubmit: handleSubmitVal,
    formState,
    reset,
  } = useForm({
    resolver: zodResolver(z.object({ costCenter: z.string() })),
  });

  const utils = trpc.useContext();

  const mutation = trpc.admin.addCostCenter.useMutation({
    onSuccess: () => {
      handleClose();
      utils.admin.invalidate();
      reset();
    },
  });

  const onSubmit = handleSubmitVal((props) => {
    const { costCenter } = props;
    mutation.mutate(costCenter);
  });

  const areAnyErrors = Object.keys(formState?.errors).length > 0;
  return (
    <>
      {show && <div className="fixed inset-0 z-40 bg-black/30 transition-opacity" aria-hidden="true"></div>}
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        show={show}
        as={Fragment}
      >
        <Dialog
          onClose={() => {
            handleClose();
            reset();
          }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex min-h-screen items-center justify-center sm:block sm:p-0">
            <Dialog.Panel
              className="fixed top-[50%] left-[50%] z-50 w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] overflow-hidden rounded-lg bg-white px-5 py-6 shadow-xl transition-all focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 sm:my-8 sm:w-full sm:max-w-lg sm:align-middle md:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className=" mb-4">
                <Dialog.Title className="text-md font-medium leading-6 text-gray-900">
                  Nuevo centro de costos
                </Dialog.Title>
                {areAnyErrors && (
                  <span className="text-red-500" style={{ whiteSpace: "pre" }}>
                    Se debe indicar un centro de costos
                  </span>
                )}
              </div>

              <form onSubmit={onSubmit} className="grid gap-2">
                <Input register={register} required label="Centro de Costos" name="costCenter" />

                <div className="flex gap-2 pt-4 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      reset();
                    }}
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-gray-200 px-4 py-2 text-base  font-medium text-gray-500  shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                  <input
                    type="submit"
                    value="Agregar"
                    className="inline-flex w-full justify-center rounded-md border border-indigo-600 bg-indigo-600 px-4 py-2  text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  />
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

const EmailInputModal = ({ handleClose, show }: { show: boolean; handleClose: () => void }) => {
  const {
    register,
    handleSubmit: handleSubmitVal,
    formState,
    reset,
  } = useForm({
    resolver: zodResolver(z.object({ email: z.string() })),
  });

  const utils = trpc.useContext();

  const mutation = trpc.admin.addAllowedEmail.useMutation({
    onSuccess: () => {
      handleClose();
      utils.admin.invalidate();
      reset();
    },
  });

  const onSubmit = handleSubmitVal((props) => {
    const { email } = props;
    mutation.mutate(email);
  });

  const areAnyErrors = Object.keys(formState?.errors).length > 0;
  return (
    <>
      {show && <div className="fixed inset-0 z-40 bg-black/30 transition-opacity" aria-hidden="true"></div>}
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        show={show}
        as={Fragment}
      >
        <Dialog
          onClose={() => {
            handleClose();
            reset();
          }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex min-h-screen items-center justify-center sm:block sm:p-0">
            <Dialog.Panel
              className="fixed top-[50%] left-[50%] z-50 w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] overflow-hidden rounded-lg bg-white px-5 py-6 shadow-xl transition-all focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 sm:my-8 sm:w-full sm:max-w-lg sm:align-middle md:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className=" mb-4">
                <Dialog.Title className="text-md font-medium leading-6 text-gray-900">
                  Nueva habilitación de email
                </Dialog.Title>
                {areAnyErrors && (
                  <span className="text-red-500" style={{ whiteSpace: "pre" }}>
                    Se debe indicar un email
                  </span>
                )}
              </div>

              <form onSubmit={onSubmit} className="grid gap-2">
                <Input type="email" register={register} required label="Email" name="email" />

                <div className="flex gap-2 pt-4 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      reset();
                    }}
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-gray-200 px-4 py-2 text-base  font-medium text-gray-500  shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                  <input
                    type="submit"
                    value="Agregar"
                    className="inline-flex w-full justify-center rounded-md border border-indigo-600 bg-indigo-600 px-4 py-2  text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  />
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

const UsersModal = ({ handleShow, show }: { show: boolean; handleShow: (show: boolean) => void }) => {
  const utils = trpc.useContext();

  const { data: emails } = trpc.admin.getAllowedEmails.useQuery();
  const deleteCostCenterMutation = trpc.admin.deleteAllowedEmail.useMutation({
    onSuccess: () => {
      utils.admin.invalidate();
    },
  });

  const { rows: emailsRows, DataTable: EmailsTable } = useTable({
    rows: emails,
  });

  const [showInputModal, setShowInputModal] = useState(false);

  return (
    <>
      <EmailInputModal
        show={showInputModal}
        handleClose={() => {
          setShowInputModal(false);
        }}
      />
      <Toaster position="top-center" reverseOrder={false} />
      {show && <div className="fixed inset-0 z-20 bg-black/30 transition-opacity" aria-hidden="true"></div>}
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        show={show}
        as={Fragment}
      >
        <Dialog onClose={() => handleShow(false)} className="fixed inset-0 z-30 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center sm:block sm:p-0">
            <Dialog.Panel
              className="fixed top-[50%] left-[50%] z-50 w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] overflow-hidden rounded-lg bg-white px-5 py-6 shadow-xl transition-all focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 sm:my-8 sm:w-full sm:max-w-lg sm:align-middle md:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className=" mb-4">
                <Dialog.Title className="text-md font-medium leading-6 text-gray-900">
                  Administrar Usuarios
                </Dialog.Title>
                <X
                  className="absolute right-4 top-4 h-4 w-4 cursor-pointer text-gray-400"
                  onClick={() => handleShow(false)}
                />
              </div>

              <EmailsTable.Root rounded="all" className="w[330px]">
                <EmailsTable.Head>
                  <EmailsTable.Column accessor="email" label="Email" align="left" />
                  <EmailsTable.Column accessorAlias="actions" label="Acciones" align="center" />
                </EmailsTable.Head>
                <EmailsTable.Body>
                  {emailsRows.map(({ row }) => (
                    <EmailsTable.Row key={row.id} row={row}>
                      <EmailsTable.Cell className=" text-lg" accessor="email" align="left" />
                      <EmailsTable.Cell accessorAlias="actions" align="center">
                        <div className="space-x-4">
                          <button
                            onClick={async () => {
                              const confirm = await dialog({
                                title: "Eliminar Usuario",
                                body: (
                                  <div>
                                    ¿Estás seguro que deseas eliminar el acceso de{" "}
                                    <span className="font-medium">{row.email}</span>?
                                  </div>
                                ),
                              });

                              if (confirm) {
                                deleteCostCenterMutation.mutate(Number(row.id));
                              }
                            }}
                            className=" rounded-md bg-red-600 p-0.5 text-white"
                          >
                            <Trash2 className="h-5 w-5 " />
                          </button>
                        </div>
                      </EmailsTable.Cell>
                    </EmailsTable.Row>
                  ))}
                </EmailsTable.Body>
              </EmailsTable.Root>

              <div className="flex w-full justify-end pt-2">
                <button
                  onClick={() => setShowInputModal(true)}
                  className="mt-2 inline-flex w-full justify-center rounded-md border border-indigo-600 bg-indigo-600 px-4 py-2 text-base  font-medium text-white shadow-sm hover:bg-indigo-700  sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Agregar nuevo usuario
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }
  if (!session.user?.isAdmin) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

export default Home;
